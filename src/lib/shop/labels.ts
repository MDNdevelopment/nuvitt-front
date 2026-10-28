import type { Dictionary } from "@/dictionaries/es";

/** Subconjunto del diccionario que necesitan los componentes cliente de la tienda. */
export const buyLabels = (d: Dictionary) => ({
  price: d.shop.price,
  addToCart: d.shop.addToCart,
  added: d.shop.added,
  viewCart: d.shop.viewCart,
  outOfStock: d.shop.outOfStock,
  quantity: d.shop.quantity,
  increase: d.shop.increase,
  decrease: d.shop.decrease,
  rateNote: d.shop.rateNote,
  inStock: d.shop.inStock,
  lowStock: d.shop.lowStock,
  add: d.shop.add,
});

export type BuyLabels = ReturnType<typeof buyLabels>;

export const accountLabels = (d: Dictionary) => ({
  tabs: d.account.tabs,
  fields: d.account.fields,
  actions: {
    login: d.account.actions.login,
    loggingIn: d.account.actions.loggingIn,
    register: d.account.actions.register,
    registering: d.account.actions.registering,
    save: d.account.actions.save,
    saving: d.account.actions.saving,
  },
});
