import SecurityAPI from '../api/security'

const RESET = 'RESET'
const AUTHENTICATING = 'AUTHENTICATING'
const AUTHENTICATING_SUCCESS = 'AUTHENTICATING_SUCCESS'
const AUTHENTICATING_PAGE = 'AUTHENTICATING_PAGE'
const AUTHENTICATING_TAB = 'AUTHENTICATING_TAB'
const AUTHENTICATING_ERROR = 'AUTHENTICATING_ERROR'
const PROVIDING_DATA_ON_REFRESH_SUCCESS = 'PROVIDING_DATA_ON_REFRESH_SUCCESS'

export default {
  namespaced: true,
  state: {
    isLoading: false,
    error: null,
    isAuthenticated: false,
    page: null,
    tab: 'product',
    user: null,
  },
  getters: {
    isLoading(state) {
      return state.isLoading
    },
    hasError(state) {
      return state.error !== null
    },
    error(state) {
      return state.error
    },
    getPageName(state) {
      return state.page
    },
    isAuthenticated(state) {
      return state.isAuthenticated
    },
    hasRole(state) {
      return (role) => {
        return state.user.roles.includes(role)
      }
    },
  },
  mutations: {
    [RESET](state) {
      state.isLoading = false
      state.error = null
      state.isAuthenticated = false
      state.user = null
      state.page = null
      state.tab = 'product'
    },
    [AUTHENTICATING](state) {
      state.isLoading = true
      state.error = null
      state.isAuthenticated = false
      state.user = null
    },
    [AUTHENTICATING_SUCCESS](state, user) {
      state.isLoading = false
      state.error = null
      state.isAuthenticated = true
      state.user = user
    },
    [PROVIDING_DATA_ON_REFRESH_SUCCESS](state, obj) {
      state.isLoading = obj.isLoading !== null
      state.error = obj.error
      state.isAuthenticated = obj.isAuthenticated !== null
      state.user = obj.user
    },
    [AUTHENTICATING_ERROR](state, error) {
      state.isLoading = false
      state.error = error
      state.isAuthenticated = false
      state.user = null
    },
    [AUTHENTICATING_PAGE](state, page) {
      state.page = page
    },
    [AUTHENTICATING_TAB](state, tab) {
      state.tab = tab
    },
  },
  actions: {
    async login({ commit }, payload) {
      commit(AUTHENTICATING)
      try {
        const response = await SecurityAPI.login(
          payload.email,
          payload.password
        )
        commit(AUTHENTICATING_SUCCESS, response.data)
        return response.data
      } catch (error) {
        commit(AUTHENTICATING_ERROR, error)
        return null
      }
    },
    setPage({ commit }, payload) {
      commit(AUTHENTICATING_PAGE, payload)
    },
    setTab({ commit }, payload) {
      commit(AUTHENTICATING_TAB, payload)
    },
    setStore({ commit }, payload) {
      commit(PROVIDING_DATA_ON_REFRESH_SUCCESS, payload)
    },
    logout({ commit }) {
      commit(RESET)
      return SecurityAPI.logout()
    },
  },
}
