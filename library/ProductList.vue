<template>
  <b-container>
    <!-- Filter and Add product -->
    <b-row class="mb-3">
      <b-col lg="6" class="my-1">
        <b-form-group
          label="Filter"
          label-cols-sm="3"
          label-align-sm="right"
          label-size="sm"
          label-for="filterInput"
          class="mb-0"
        >
          <b-input-group size="sm">
            <b-form-input
              id="filterInput"
              v-model="filter"
              type="search"
              placeholder="Type to Search"
            ></b-form-input>
            <b-input-group-append>
              <b-button :disabled="!filter" @click="filter = ''"
                >Clear</b-button
              >
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>
      <b-col
        lg="3"
        class="my-1"
        style="display: flex; justify-content: flex-end;"
      >
        <b-button size="sm" @click="import_csv()">
          <b-icon icon="plus-circle" aria-hidden="true"></b-icon>
          Import CSV
        </b-button>
        <b-form-file
          ref="fileInput"
          v-model="file"
          style="display: none;"
          accept=".csv"
          @input="load_csv()"
        />
      </b-col>
      <b-col
        lg="3"
        class="my-1"
        style="display: flex; justify-content: flex-end;"
      >
        <b-button size="sm" @click="product_add()">
          <b-icon icon="plus-circle" aria-hidden="true"></b-icon>
          Add Product
        </b-button>
      </b-col>
    </b-row>

    <b-table
      show-empty
      small
      stacked="md"
      :bordered="bordered"
      :items="items"
      :fields="fields"
      :busy="isBusy"
      :current-page="currentPage"
      :per-page="perPage"
      :filter="filter"
      :filter-included-fields="filterOn"
      @filtered="onFiltered"
    >
      <template v-slot:cell(edit)="row">
        <b-button size="sm" @click="product_edit(row.item, row.index)">
          <b-icon icon="check" aria-hidden="true"></b-icon>
        </b-button>
      </template>
      <template v-slot:table-busy>
        <div class="text-center my-2">
          <b-spinner class="align-middle"></b-spinner>
          <strong>Loading...</strong>
        </div>
      </template>
    </b-table>

    <b-row>
      <b-col sm="5" md="6" class="my-1">
        <b-form-group
          label="Per page"
          label-cols-sm="6"
          label-cols-md="4"
          label-cols-lg="3"
          label-align-sm="right"
          label-size="sm"
          label-for="perPageSelect"
          class="mb-0"
        >
          <b-form-select
            id="perPageSelect"
            v-model="perPage"
            size="sm"
            :options="pageOptions"
          ></b-form-select>
        </b-form-group>
      </b-col>

      <b-col sm="7" md="6" class="my-1">
        <b-pagination
          v-model="currentPage"
          :total-rows="totalRows"
          :per-page="perPage"
          align="fill"
          size="sm"
          class="my-0"
        ></b-pagination>
      </b-col>
    </b-row>

    <b-modal
      id="product_modal"
      v-model="show"
      :title="modal_title"
      :hide-header-close="header_status"
    >
      <b-container fluid style="margin: auto;">
        <b-row class="mb-1">
          <b-col cols="4">Product Code</b-col>
          <b-col>
            <b-form-input
              v-model="product_input"
              :state="product_input.length > 0"
            ></b-form-input>
          </b-col>
        </b-row>

        <b-row class="mb-1">
          <b-col cols="4">Packaging</b-col>
          <b-col>
            <b-form-input
              v-model="packaging_input"
              :state="packaging_input.length > 0"
            ></b-form-input>
          </b-col>
        </b-row>

        <b-row class="mb-1">
          <b-col cols="4">CFID</b-col>
          <b-col>
            <b-form-input
              v-model="cfid_input"
              :state="cfid_input.length > 0"
            ></b-form-input>
          </b-col>
        </b-row>

        <b-row class="mb-1">
          <b-col cols="4">Size</b-col>
          <b-col>
            <b-form-input
              v-model="size_input"
              :state="size_input.length > 0"
            ></b-form-input>
          </b-col>
        </b-row>

        <b-row>
          <b-col cols="4">With Label</b-col>
          <b-col>
            <b-form-select
              v-model="labelVariant"
              :options="label_variants"
            ></b-form-select>
          </b-col>
        </b-row>
      </b-container>

      <template v-slot:modal-footer>
        <div class="w-100" style="display: grid;">
          <b-button-group style="height: 45px;">
            <b-button
              variant="primary"
              size="sm"
              class="float-right"
              style="margin-right: 4px;"
              @click="product_update"
            >
              {{ btn_params }}
            </b-button>
            <b-button
              v-if="modal_title === 'Edit'"
              variant="primary"
              size="sm"
              class="float-right"
              style="margin-right: 4px;"
              @click="product_delete"
            >
              Delete
            </b-button>
            <b-button
              variant="primary"
              size="sm"
              class="float-right"
              @click="show = false"
            >
              Cancel
            </b-button>
          </b-button-group>
        </div>
      </template>
    </b-modal>
  </b-container>
</template>

<script>
import ProductsQuery from '@/components/library/products.query.gql'
import CreateProductMutation from '@/components/library/create_product.mutation.gql'
import UpdateProductMutation from '@/components/library/update_product.mutation.gql'
import DeleteProductMutation from '@/components/library/delete_product.mutation.gql'
// import UploadAPI from '@/api/upload'

export default {
  name: 'ProductList',
  data() {
    return {
      items: [],
      fields: [
        {
          key: 'lib_id',
          label: 'ID',
        },
        {
          key: 'prod_code',
          label: 'Product Code',
          class: 'text-center',
        },
        {
          key: 'cfid',
          label: 'CFID',
          class: 'text-center',
        },
        {
          key: 'packaging',
          label: 'Packaging',
          class: 'text-center',
        },
        {
          key: 'size',
          label: 'Size',
          class: 'text-center',
        },
        {
          key: 'label',
          label: 'Label',
          class: 'text-center',
        },
        {
          key: 'edit',
          label: 'Edit',
          class: 'text-center',
        },
      ],
      bordered: true,
      show: false,
      header_status: true,
      label_variants: ['YES', 'NO'],
      labelVariant: 'YES',
      packaging_input: '',
      size_input: '',
      product_input: '',
      cfid_input: '',
      select_id: 0,
      btn_params: '',
      modal_title: '',
      filter: null,
      filterOn: [],
      isBusy: true,
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [5, 10, 15],
      file: [],
    }
  },
  mounted() {
    this.getProductsList()
  },
  methods: {
    checkFormValidity() {
      return (
        this.packaging_input.length > 0 &&
        this.size_input.length > 0 &&
        this.product_input.length > 0 &&
        this.cfid_input.length > 0
      )
    },
    async getProductsList() {
      this.isBusy = true
      await this.$apollo
        .query({
          query: ProductsQuery,
          fetchPolicy: 'no-cache',
        })
        .then((result, loading) => {
          if (!loading) {
            let index = 1
            const products = []
            result.data.products.items.forEach((product) => {
              products.push({
                lib_id: index,
                prod_code: product.productCode,
                cfid: product.cfid,
                packaging: product.package,
                size: product.size,
                label: product.withLabel === 1 ? 'YES' : 'NO',
                id: product.id,
              })
              index++
            })
            this.items = products
            this.isBusy = false
            this.totalRows = this.items.length
          }
        })
    },
    import_csv() {
      this.$refs.fileInput.$el.querySelector('input[type=file]').click()
    },
    async load_csv() {
      if (this.file === null) {
        return
      }
      try {
        // const response = await UploadAPI.login(this.file)
        // console.log(response)
        // return response.data
        const data = this.file
        const formData = new FormData()
        formData.append('file', data)
        await this.$axios.post(
          'http://api.idms-pdfmergingtool.localhost/product/upload/',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
      } catch (error) {
        return null
      }
    },
    product_add() {
      this.show = true
      this.btn_params = 'Add'
      this.modal_title = 'Add'
    },
    product_edit(product, idx) {
      this.btn_params = 'Update'
      this.modal_title = 'Edit'
      this.show = true
      this.product_input = product.prod_code
      this.cfid_input = product.cfid
      this.packaging_input = product.packaging
      this.size_input = product.size
      this.labelVariant = product.label
      this.select_id = idx
    },
    async product_update() {
      if (!this.checkFormValidity()) {
        return
      }
      if (this.btn_params === 'Add') {
        this.isBusy = true
        const id = this.items.length + 1
        this.$bvModal.hide('product_modal')
        const labelParams = this.labelVariant === 'YES' ? 1 : 0
        await this.$apollo
          .mutate({
            mutation: CreateProductMutation,
            variables: {
              product_code: this.product_input,
              cfid: this.cfid_input,
              package: this.packaging_input,
              size: this.size_input,
              label: labelParams,
            },
          })
          .then((response) => {
            this.items.push({
              lib_id: id,
              id: response.data.createProduct.id,
              prod_code: response.data.createProduct.productCode,
              cfid: response.data.createProduct.cfid,
              packaging: response.data.createProduct.package,
              size: response.data.createProduct.size,
              label: response.data.createProduct.withLabel === 1 ? 'YES' : 'NO',
            })
            this.isBusy = false
            this.totalRows = this.items.length
            this.resetModal()
            this.toast('New product was created successfully')
          })
      } else {
        this.items[this.select_id].prod_code = this.product_input
        this.items[this.select_id].cfid = this.cfid_input
        this.items[this.select_id].packaging = this.packaging_input
        this.items[this.select_id].size = this.size_input
        this.items[this.select_id].label = this.labelVariant
        this.$bvModal.hide('product_modal')
        const labelParams = this.labelVariant === 'YES' ? 1 : 0
        const index = this.items[this.select_id].id
        await this.$apollo
          .mutate({
            mutation: UpdateProductMutation,
            variables: {
              id: index,
              product_code: this.product_input,
              cfid: this.cfid_input,
              package: this.packaging_input,
              size: this.size_input,
              label: labelParams,
            },
          })
          .then((response) => {
            this.resetModal()
            this.toast('Product was updated successfully')
          })
      }
    },
    async product_delete() {
      if (!confirm('Are you sure you want to delete this item?')) {
        return
      }
      this.isBusy = true
      this.$bvModal.hide('product_modal')
      const index = this.items[this.select_id].id
      await this.$apollo
        .mutate({
          mutation: DeleteProductMutation,
          variables: {
            id: index,
          },
        })
        .then((result, loading) => {
          if (!loading) {
            this.getProductsList()
            this.toast('New product was deleted successfully')
          }
        })
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length
      this.currentPage = 1
    },
    toast(message, vart = 'success') {
      const title = vart === 'success' ? 'Success' : 'Fail'
      this.$bvToast.toast(`${message}`, {
        title: `${title}`,
        toaster: 'b-toaster-top-center',
        variant: vart,
        solid: true,
        appendToast: false,
      })
    },
    resetModal() {
      this.packaging_input = ''
      this.size_input = ''
      this.product_input = ''
      this.cfid_input = ''
    },
  },
}
</script>
