/* =========================================================
   BiblioTech — script principal
   Contient :
   - Cart manager (localStorage) : add, remove, +/-, clear
   - dataLayer.push() pour TOUTES les interactions
   - Gestion du formulaire (submit natif + custom)
   - Mise à jour du badge panier dans la nav
   ========================================================= */

window.dataLayer = window.dataLayer || [];

/* =========================================================
   1. CART MANAGER (localStorage)
   ========================================================= */

var CART_KEY = "cart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || { items: [] };
  } catch (e) {
    return { items: [] };
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function getCartValue(cart) {
  return cart.items.reduce(function (sum, item) {
    return sum + item.price * item.quantity;
  }, 0);
}

function getCartCount(cart) {
  return cart.items.reduce(function (sum, item) {
    return sum + item.quantity;
  }, 0);
}

function addItemToCart(item) {
  var cart = getCart();
  var existing = cart.items.find(function (i) {
    return i.item_id === item.item_id;
  });
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.items.push({
      item_id: item.item_id,
      item_name: item.item_name,
      item_category: item.item_category,
      item_brand: item.item_brand,
      price: item.price,
      quantity: 1,
    });
  }
  saveCart(cart);
  return cart;
}

function decrementItem(itemId) {
  var cart = getCart();
  var item = cart.items.find(function (i) { return i.item_id === itemId; });
  if (!item) return cart;
  item.quantity -= 1;
  if (item.quantity <= 0) {
    cart.items = cart.items.filter(function (i) { return i.item_id !== itemId; });
  }
  saveCart(cart);
  return cart;
}

function removeItem(itemId) {
  var cart = getCart();
  var removed = cart.items.find(function (i) { return i.item_id === itemId; });
  cart.items = cart.items.filter(function (i) { return i.item_id !== itemId; });
  saveCart(cart);
  return { cart: cart, removed: removed };
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
}

/* =========================================================
   2. BADGE PANIER (mis à jour sur toutes les pages)
   ========================================================= */

function updateCartBadge() {
  var badge = document.getElementById("cart-badge");
  if (!badge) return;
  var count = getCartCount(getCart());
  if (count > 0) {
    badge.textContent = count;
    badge.hidden = false;
  } else {
    badge.hidden = true;
  }
}

/* =========================================================
   3. TRACKING DES CTA (data-cta)
   ========================================================= */

document.querySelectorAll("[data-cta]").forEach(function (el) {
  el.addEventListener("click", function () {
    window.dataLayer.push({
      event: "click_cta",
      cta_name: el.dataset.cta,
      cta_label: el.textContent.trim(),
      cta_position: el.dataset.ctaPosition || "unknown",
    });
  });
});

/* =========================================================
   4. PAGE PRODUIT — Ajout au panier
   ========================================================= */

var addBtn = document.getElementById("add-to-cart");
if (addBtn) {
  addBtn.addEventListener("click", function () {
    var item = {
      item_id: addBtn.dataset.itemId,
      item_name: addBtn.dataset.itemName,
      item_category: addBtn.dataset.itemCategory,
      item_brand: addBtn.dataset.itemBrand,
      price: parseFloat(addBtn.dataset.itemPrice),
    };

    addItemToCart(item);

    window.dataLayer.push({
      event: "add_to_cart",
      ecommerce: {
        currency: "EUR",
        value: item.price,
        items: [{
          item_id: item.item_id,
          item_name: item.item_name,
          item_category: item.item_category,
          item_brand: item.item_brand,
          price: item.price,
          quantity: 1,
        }],
      },
    });

    // Feedback visuel + redirection
    addBtn.textContent = "✓ Ajouté au panier";
    setTimeout(function () {
      window.location.href = "panier.html";
    }, 700);
  });
}

/* =========================================================
   5. PAGE PANIER — Rendu dynamique + actions
   ========================================================= */

function renderCart() {
  var container = document.getElementById("cart-items");
  if (!container) return;

  var cart = getCart();
  var empty = document.getElementById("cart-empty");
  var summary = document.getElementById("cart-summary");
  var clearBtn = document.getElementById("clear-cart-btn");

  // État vide
  if (cart.items.length === 0) {
    container.innerHTML = "";
    if (empty) empty.hidden = false;
    if (summary) summary.hidden = true;
    if (clearBtn) clearBtn.hidden = true;
    return;
  }

  if (empty) empty.hidden = true;
  if (summary) summary.hidden = false;
  if (clearBtn) clearBtn.hidden = false;

  // Rendu des items
  container.innerHTML = cart.items.map(function (item) {
    var initials = item.item_name.split(" ").slice(0, 2).map(function (w) {
      return w.charAt(0);
    }).join("").toUpperCase();
    var lineTotal = (item.price * item.quantity).toFixed(2).replace(".", ",");

    return ""
      + '<div class="cart-item" data-item-id="' + item.item_id + '">'
      +   '<div class="cart-item-cover">' + initials + '</div>'
      +   '<div class="cart-item-info">'
      +     '<h3>' + item.item_name + '</h3>'
      +     '<p class="muted">' + item.price.toFixed(2).replace(".", ",") + ' € l\'unité</p>'
      +     '<button class="remove-btn" data-action="remove" data-item-id="' + item.item_id + '">Supprimer</button>'
      +   '</div>'
      +   '<div class="qty-controls">'
      +     '<button class="qty-btn" data-action="decrement" data-item-id="' + item.item_id + '" aria-label="Diminuer la quantité">−</button>'
      +     '<span class="qty-value">' + item.quantity + '</span>'
      +     '<button class="qty-btn" data-action="increment" data-item-id="' + item.item_id + '" aria-label="Augmenter la quantité">+</button>'
      +   '</div>'
      +   '<p class="cart-item-price">' + lineTotal + ' €</p>'
      + '</div>';
  }).join("");

  // Résumé
  var value = getCartValue(cart);
  var formatted = value.toFixed(2).replace(".", ",") + " €";
  var subtotal = document.getElementById("subtotal");
  var total = document.getElementById("total");
  if (subtotal) subtotal.textContent = formatted;
  if (total) total.textContent = formatted;
}

// Délégation d'événements sur le conteneur panier
var cartItemsContainer = document.getElementById("cart-items");
if (cartItemsContainer) {
  cartItemsContainer.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-action]");
    if (!btn) return;

    var action = btn.dataset.action;
    var itemId = btn.dataset.itemId;
    var cart = getCart();
    var item = cart.items.find(function (i) { return i.item_id === itemId; });
    if (!item) return;

    if (action === "increment") {
      addItemToCart({
        item_id: item.item_id,
        item_name: item.item_name,
        item_category: item.item_category,
        item_brand: item.item_brand,
        price: item.price,
      });
      window.dataLayer.push({
        event: "add_to_cart",
        ecommerce: {
          currency: "EUR",
          value: item.price,
          items: [{
            item_id: item.item_id,
            item_name: item.item_name,
            item_category: item.item_category,
            item_brand: item.item_brand,
            price: item.price,
            quantity: 1,
          }],
        },
      });
    } else if (action === "decrement") {
      decrementItem(itemId);
      window.dataLayer.push({
        event: "remove_from_cart",
        ecommerce: {
          currency: "EUR",
          value: item.price,
          items: [{
            item_id: item.item_id,
            item_name: item.item_name,
            item_category: item.item_category,
            item_brand: item.item_brand,
            price: item.price,
            quantity: 1,
          }],
        },
      });
    } else if (action === "remove") {
      var result = removeItem(itemId);
      if (result.removed) {
        window.dataLayer.push({
          event: "remove_from_cart",
          ecommerce: {
            currency: "EUR",
            value: result.removed.price * result.removed.quantity,
            items: [{
              item_id: result.removed.item_id,
              item_name: result.removed.item_name,
              item_category: result.removed.item_category,
              item_brand: result.removed.item_brand,
              price: result.removed.price,
              quantity: result.removed.quantity,
            }],
          },
        });
      }
    }

    renderCart();
  });
}

// Bouton "Vider le panier"
var clearBtn = document.getElementById("clear-cart-btn");
if (clearBtn) {
  clearBtn.addEventListener("click", function () {
    var cart = getCart();
    if (cart.items.length === 0) return;

    window.dataLayer.push({
      event: "remove_from_cart",
      ecommerce: {
        currency: "EUR",
        value: getCartValue(cart),
        items: cart.items,
      },
    });

    clearCart();
    renderCart();
  });
}

// Bouton "Valider la commande" → begin_checkout
var checkoutBtn = document.getElementById("checkout-btn");
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", function () {
    var cart = getCart();
    if (cart.items.length === 0) return;

    window.dataLayer.push({
      event: "begin_checkout",
      ecommerce: {
        currency: "EUR",
        value: getCartValue(cart),
        items: cart.items,
      },
    });

    setTimeout(function () {
      window.location.href = "confirmation.html";
    }, 300);
  });
}

/* =========================================================
   6. PAGE CONFIRMATION — Affichage de la transaction
   ========================================================= */

if (window.__lastTransaction) {
  var idEl = document.getElementById("transaction-id");
  var valEl = document.getElementById("transaction-value");
  if (idEl) idEl.textContent = window.__lastTransaction.id;
  if (valEl) {
    valEl.textContent =
      window.__lastTransaction.value.toFixed(2).replace(".", ",") + " €";
  }
}

/* =========================================================
   7. PAGE CONTACT — Formulaire
   - Validation HTML5 native (pas de novalidate sur le form)
   - GTM peut capter le submit natif via "Form Submission"
   - On pousse aussi un event custom dans le dataLayer
   ========================================================= */

var contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    // Le navigateur a déjà validé : si on est ici, c'est que le form est valide.
    // (Sans novalidate, l'event submit ne fire que si checkValidity() === true)

    var data = new FormData(contactForm);

    window.dataLayer.push({
      event: "form_submit",
      form_name: contactForm.getAttribute("name") || "contact-form",
      form_id: contactForm.id,
      form_subject: data.get("sujet") || "non_renseigne",
    });

    // On empêche la vraie soumission HTTP (le form n'a pas de backend)
    e.preventDefault();

    // Feedback visuel
    var success = document.getElementById("form-success");
    if (success) success.hidden = false;
    contactForm.reset();
  });
}

/* =========================================================
   8. INIT
   ========================================================= */

updateCartBadge();
renderCart();
