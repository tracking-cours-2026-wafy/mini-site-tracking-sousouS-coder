# BiblioTech — Site pédagogique Web Analytics

Mini-site e-commerce pour apprendre **Google Tag Manager** et le tracking côté front.

## 🎯 Ton objectif

Configurer GTM (et GA4) pour capter toutes les interactions du site.
**Quasiment aucune ligne de code à écrire** — le site pousse déjà tous
les events dans le `dataLayer`. Ton travail est de configurer GTM pour
les exploiter.

➡️ **Va sur la page [Exercices](exercices.html) pour la liste des 10 missions.**

## Structure du site

| Page                | Contenu                                    | Events dataLayer                                |
|---------------------|--------------------------------------------|--------------------------------------------------|
| `index.html`        | Accueil, 2 CTAs (CTA 1 / CTA 2)            | `page_view`, `click_cta`                        |
| `produit.html`      | Fiche produit, bouton ajout panier         | `view_item`, `add_to_cart`                      |
| `panier.html`       | Panier dynamique (localStorage), +/- /vider | `view_cart`, `add_to_cart`, `remove_from_cart`, `begin_checkout` |
| `confirmation.html` | Récap commande, vide le panier             | `purchase`                                       |
| `contact.html`      | Formulaire (validation HTML5 native)       | `page_view`, `form_submit`                      |
| `blog.html`         | Long article pour scroll tracking          | `page_view`                                      |
| `exercices.html`    | Les 10 missions du cours                   | `page_view`                                      |

## Panier dynamique

Le panier est persistant via `localStorage` :

- Cliquer plusieurs fois sur « Ajouter au panier » incrémente la quantité
- Sur la page panier : boutons +/-, suppression d'une ligne, vider le panier
- Chaque action déclenche un event GA4 e-commerce (`add_to_cart`, `remove_from_cart`)
- Le `value` et le tableau `items[]` reflètent toujours l'état réel du panier
- À l'achat, l'event `purchase` est poussé puis le panier est vidé

## Formulaire

Le formulaire de contact est codé proprement :

- Attributs `action` et `method` présents
- Validation HTML5 native (`required`, `minlength`, `type="email"`) — pas de `novalidate`
- Le submit event ne fire que si la validation passe → GTM peut donc utiliser
  le déclencheur natif **« Form Submission »**
- En plus, un event `form_submit` custom est poussé dans le dataLayer

Cela permet aux élèves de comparer les deux approches dans GTM.

## Mise en route

1. **Active GitHub Pages** : Settings → Pages → branch `main`, root → Save
2. **Ouvre `exercices.html`** dans le navigateur via l'URL GitHub Pages
3. **Commence par l'exercice 1** : coller le snippet GTM dans toutes les pages

## Inspecter le dataLayer

Une fois sur n'importe quelle page, ouvre la console DevTools et tape :

```javascript
window.dataLayer
```

Tu verras tous les events poussés. Sur la page panier, navigue avec les boutons
+/- pour voir les events `add_to_cart` / `remove_from_cart` arriver en temps réel.
