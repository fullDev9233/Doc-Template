<template>
  <div>
    <NavBar></NavBar>
    <b-card no-body>
      <b-tabs card>
        <b-tab
          title="Product List"
          :active="tab === 'product'"
          @click="setTab('product')"
        >
          <ProductList></ProductList>
        </b-tab>
        <b-tab
          title="Country List"
          :active="tab === 'country'"
          @click="setTab('country')"
        >
          <CountryList></CountryList>
        </b-tab>
        <b-tab
          title="Partner List"
          :active="tab === 'partner'"
          @click="setTab('partner')"
        >
          <PartnerList></PartnerList>
        </b-tab>
        <b-tab
          title="Guru List"
          :active="tab === 'guru'"
          @click="setTab('guru')"
        >
          <GuruList></GuruList>
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar'
import ProductList from '@/components/library/ProductList'
import CountryList from '@/components/library/CountryList'
import PartnerList from '@/components/library/PartnerList'
import GuruList from '@/components/library/GuruList'
export default {
  components: { NavBar, ProductList, CountryList, PartnerList, GuruList },
  data() {
    return {
      tab: 'product',
    }
  },
  mounted() {
    this.tab = this.$store.state.security.tab
  },
  methods: {
    async setTab(tab) {
      await this.$store.dispatch('security/setTab', tab)
    },
  },
}
</script>

<style>
.modal-header {
  justify-content: center;
}
</style>
