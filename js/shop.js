const CART_KEY = 'museumCartV1';

function readCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch (e) { return []; }
}

function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(btn) {
  var id = btn.dataset.id;
  var name = btn.dataset.name;
  var unitPrice = Number(btn.dataset.price);
  var image = btn.dataset.image || '';
  var cart = readCart();
  var idx = -1;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === id) { idx = i; break; }
  }
  if (idx >= 0) {
    cart[idx].qty += 1;
  } else {
    cart.push({ id: id, name: name, unitPrice: unitPrice, qty: 1, image: image });
  }
  writeCart(cart);
  var card = btn.closest('.souvenir-item');
  if (card) {
    var badge = card.querySelector('.qty-badge');
    if (badge) {
      var item = cart[idx >= 0 ? idx : cart.length - 1];
      badge.textContent = item ? 'Qty: ' + item.qty : '';
    }
  }
}

function openModal(name, imgSrc, desc) {
  document.getElementById('modalTitle').textContent = name;
  document.getElementById('modalImg').src = imgSrc;
  document.getElementById('modalImg').alt = name;
  document.getElementById('modalDesc').textContent = desc;
  document.getElementById('itemModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('itemModal').style.display = 'none';
}
