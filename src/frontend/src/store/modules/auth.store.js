export const SIGN_IN = "SIGN_IN";
export const SIGN_OUT = "SIGN_OUT";
export const SET_ACCOUNT = "SET_ACCOUNT";
export const LOAD_ADDRESSES = "LOAD_ADDRESSES";
export const UPDATE_ADDRESSES = "UPDATE_ADDRESSES";

export default {
  namespaced: true,
  state: () => ({
    account: null,
    addresses: [],
  }),
  getters: {
    isLogged({ account }) {
      return !!account;
    },
    newAddress() {
      return {
        id: null,
        name: null,
        street: "",
        building: "",
        flat: "",
      };
    },
    deliveryAddresses({ addresses }, { newAddress }) {
      return [null, newAddress, ...addresses];
    },
  },
  actions: {
    async [SIGN_IN]({ dispatch }, { email, password }) {
      const { token } = await this.$api.auth.login({ email, password });
      this.$jwt.saveToken(token);
      this.$api.auth.setAuthHeader();

      dispatch(SET_ACCOUNT);
    },
    async [SIGN_OUT]({ commit }) {
      try {
        await this.$api.auth.logout();
      } finally {
        this.$jwt.deleteToken();
        this.$api.auth.setAuthHeader();

        commit(SET_ACCOUNT);
        commit(UPDATE_ADDRESSES);
      }
    },
    async [SET_ACCOUNT]({ dispatch, commit }) {
      try {
        const account = await this.$api.auth.whoAmI();
        commit(SET_ACCOUNT, account);
        dispatch(LOAD_ADDRESSES);
      } catch {
        dispatch(SIGN_OUT);
      }
    },
    async [LOAD_ADDRESSES]({ commit }) {
      const addresses = await this.$api.addresses.query();
      commit(UPDATE_ADDRESSES, addresses);
    },
  },
  mutations: {
    [SET_ACCOUNT](state, account = null) {
      Object.assign(state, { account });
    },
    [UPDATE_ADDRESSES](state, addresses = []) {
      Object.assign(state, { addresses });
    },
  },
};
