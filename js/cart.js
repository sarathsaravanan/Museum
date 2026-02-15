var TAX_RATE = 0.102;
var MEMBER_DISCOUNT_RATE = 0.15;
var SHIPPING_RATE = 25;
var VOLUME_DISCOUNT_TIERS = [
  [0, 49.99, 0],
  [50, 99.99, 0.05],
  [100, 199.99, 0.10],
  [200, 1e9, 0.15]
];
var CART_KEY = 'museumCartV1';
var memberChecked = false;
var discountChoice = '';

function readCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch (e) { return []; }
}

function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function removeItem(id) {
  var cart = readCart();
  cart = cart.filter(function(it) { return it.id !== id; });
  writeCart(cart);
  discountChoice = '';
  render();
}

function clearCart() {
  writeCart([]);
  memberChecked = false;
  discountChoice = '';
  render();
}

function fmt(n) {
  var a = Math.abs(n);
  var s = (Math.round(a * 100) / 100).toFixed(2);
  if (n < 0) return '(' + s + ')';
  return s;
}

function render() {
  var cart = readCart();
  var i;
  for (i = cart.length - 1; i >= 0; i--) {
    if (cart[i].qty <= 0 || cart[i].unitPrice === 0) cart.splice(i, 1);
  }
  writeCart(cart);

  var memberCb = document.getElementById('memberCb');
  if (memberCb) memberChecked = memberCb.checked;

  var itemTotal = 0;
  for (i = 0; i < cart.length; i++) {
    itemTotal += cart[i].unitPrice * cart[i].qty;
  }
  itemTotal = Math.round(itemTotal * 100) / 100;

  var volumeRate = 0;
  for (i = 0; i < VOLUME_DISCOUNT_TIERS.length; i++) {
    if (itemTotal >= VOLUME_DISCOUNT_TIERS[i][0] && itemTotal <= VOLUME_DISCOUNT_TIERS[i][1]) {
      volumeRate = VOLUME_DISCOUNT_TIERS[i][2];
      break;
    }
  }
  var volumeAmount = Math.round(itemTotal * volumeRate * 100) / 100;
  var memberAmount = 0;
  if (memberChecked) memberAmount = Math.round(itemTotal * MEMBER_DISCOUNT_RATE * 100) / 100;

  var useVolume = false;
  var useMember = false;
  if (volumeAmount > 0 && memberAmount > 0) {
    if (!discountChoice) {
      discountChoice = prompt('Only one discount allowed. Type 1 for Volume, 2 for Member.');
    }
    if (discountChoice === '1') useVolume = true;
    else if (discountChoice === '2') useMember = true;
    else useVolume = true;
  } else if (volumeAmount > 0) useVolume = true;
  else if (memberAmount > 0) useMember = true;

  var discountAmount = 0;
  if (useVolume) discountAmount = volumeAmount;
  else if (useMember) discountAmount = memberAmount;

  var shipping = cart.length > 0 ? SHIPPING_RATE : 0;
  var subtotalTaxable = Math.round((itemTotal - discountAmount + shipping) * 100) / 100;
  var taxAmount = Math.round(subtotalTaxable * TAX_RATE * 100) / 100;
  var invoiceTotal = Math.round((subtotalTaxable + taxAmount) * 100) / 100;

  var volumeDisplay = useVolume ? volumeAmount : 0;
  var memberDisplay = useMember ? memberAmount : 0;
  if (!useVolume) volumeDisplay = 0;
  if (!useMember) memberDisplay = 0;

  var out = document.getElementById('cart-output');
  if (!out) return;

  var html = '';
  if (cart.length === 0) {
    html = '<p class="cart-empty">Your cart is empty.</p>';
    html += '<p><a href="shop.html" class="cart-link">Keep Shopping</a></p>';
    html += '<table class="cart-summary"><tbody>';
    html += '<tr><td>Subtotal of ItemTotals</td><td class="amount-col">$0.00</td></tr>';
    html += '<tr><td>Volume Discount</td><td class="amount-col">$0.00</td></tr>';
    html += '<tr><td>Member Discount</td><td class="amount-col">$0.00</td></tr>';
    html += '<tr><td>Shipping</td><td class="amount-col">$0.00</td></tr>';
    html += '<tr><td>Subtotal (Taxable amount)</td><td class="amount-col">$0.00</td></tr>';
    html += '<tr><td>Tax Rate %</td><td class="amount-col">10.2%</td></tr>';
    html += '<tr><td>Tax Amount</td><td class="amount-col">$0.00</td></tr>';
    html += '<tr><td>Invoice Total</td><td class="amount-col">$0.00</td></tr>';
    html += '</tbody></table>';
  } else {
    html += '<table class="cart-table"><thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th class="amount-col">Line Total</th><th></th></tr></thead><tbody>';
    for (i = 0; i < cart.length; i++) {
      var it = cart[i];
      var lineTotal = Math.round(it.unitPrice * it.qty * 100) / 100;
      html += '<tr>';
      html += '<td><img src="' + (it.image || '') + '" alt="" class="cart-thumb"> ' + it.name + '</td>';
      html += '<td>' + it.qty + '</td>';
      html += '<td>$' + fmt(it.unitPrice) + '</td>';
      html += '<td class="amount-col">$' + fmt(lineTotal) + '</td>';
      html += '<td><button type="button" class="cart-remove-btn" onclick="removeItem(\'' + it.id + '\')">Remove</button></td>';
      html += '</tr>';
    }
    html += '</tbody></table>';
    html += '<p><button type="button" class="cart-clear-btn" onclick="clearCart()">Clear Cart</button></p>';
    html += '<p><a href="shop.html" class="cart-link">Keep Shopping</a></p>';
    html += '<div class="cart-summary-block">';
    html += '<p><label><input type="checkbox" id="memberCb" ' + (memberChecked ? 'checked' : '') + ' onchange="memberChecked=this.checked; discountChoice=\'\'; render();"> Member discount</label></p>';
    html += '<table class="cart-summary"><tbody>';
    html += '<tr><td>Subtotal of ItemTotals</td><td class="amount-col">$' + fmt(itemTotal) + '</td></tr>';
    html += '<tr><td>Volume Discount</td><td class="amount-col">' + (volumeDisplay > 0 ? '($' + fmt(volumeDisplay) + ')' : '$0.00') + '</td></tr>';
    html += '<tr><td>Member Discount</td><td class="amount-col">' + (memberDisplay > 0 ? '($' + fmt(memberDisplay) + ')' : '$0.00') + '</td></tr>';
    html += '<tr><td>Shipping</td><td class="amount-col">$' + fmt(shipping) + '</td></tr>';
    html += '<tr><td>Subtotal (Taxable amount)</td><td class="amount-col">$' + fmt(subtotalTaxable) + '</td></tr>';
    html += '<tr><td>Tax Rate %</td><td class="amount-col">10.2%</td></tr>';
    html += '<tr><td>Tax Amount</td><td class="amount-col">$' + fmt(taxAmount) + '</td></tr>';
    html += '<tr><td>Invoice Total</td><td class="amount-col">$' + fmt(invoiceTotal) + '</td></tr>';
    html += '</tbody></table></div>';
  }
  out.innerHTML = html;
}
