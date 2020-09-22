<template>
  <b-container>
    <!-- Filter and Add Partner -->
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
        lg="6"
        class="my-1"
        style="display: flex; justify-content: flex-end;"
      >
        <b-button size="sm" @click="partner_add()">
          <b-icon icon="plus-circle" aria-hidden="true"></b-icon>
          Add Partner
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
        <b-button size="sm" @click="partner_edit(row.item, row.index)">
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
      id="partner_modal"
      v-model="show"
      :title="modal_title"
      :hide-header-close="header_status"
    >
      <b-container fluid style="margin: auto;">
        <b-row class="mb-1">
          <b-col cols="4">Partner Code</b-col>
          <b-col>
            <b-form-input
              v-model="code_input"
              :state="code_input.length > 0"
            ></b-form-input>
          </b-col>
        </b-row>

        <b-row class="mb-1">
          <b-col cols="4">Name</b-col>
          <b-col>
            <b-form-input
              v-model="name_input"
              :state="name_input.length > 0"
            ></b-form-input>
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
              @click="partner_update"
            >
              {{ btn_params }}
            </b-button>
            <b-button
              v-if="modal_title === 'Edit'"
              variant="primary"
              size="sm"
              class="float-right"
              style="margin-right: 4px;"
              @click="partner_delete"
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
import PartnersQuery from '@/components/library/partners.query.gql'
import CreatePartnerMutation from '@/components/library/create_partner.mutation.gql'
import UpdatePartnerMutation from '@/components/library/update_partner.mutation.gql'
import DeletePartnerMutation from '@/components/library/delete_partner.mutation.gql'

export default {
  name: 'PartnerList',
  data() {
    return {
      items: [],
      fields: [
        {
          key: 'c_id',
          label: 'ID',
        },
        {
          key: 'partner_code',
          label: 'Partner Code',
          class: 'text-center',
        },
        {
          key: 'name',
          label: 'Partner Name',
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
      code_input: '',
      name_input: '',
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
    }
  },
  mounted() {
    this.getPartnerList()
  },
  methods: {
    checkFormValidity() {
      return this.code_input.length > 0 && this.name_input.length > 0
    },
    async getPartnerList() {
      this.isBusy = true
      await this.$apollo
        .query({
          query: PartnersQuery,
          fetchPolicy: 'no-cache',
        })
        .then((result, loading) => {
          if (!loading) {
            let index = 1
            const partners = []
            result.data.partners.items.forEach((partner) => {
              partners.push({
                c_id: index,
                partner_code: partner.partnerCode,
                name: partner.name,
                id: partner.id,
              })
              index++
            })
            this.items = partners
            this.isBusy = false
            this.totalRows = this.items.length
          }
        })
    },
    partner_add() {
      this.show = true
      this.btn_params = 'Add'
      this.modal_title = 'Add'
    },
    partner_edit(partner, idx) {
      this.btn_params = 'Update'
      this.modal_title = 'Edit'
      this.show = true
      this.code_input = partner.partner_code
      this.name_input = partner.name
      this.select_id = idx
    },
    async partner_update() {
      if (!this.checkFormValidity()) {
        return
      }
      if (this.btn_params === 'Add') {
        this.isBusy = true
        const id = this.items.length + 1
        this.$bvModal.hide('partner_modal')
        await this.$apollo
          .mutate({
            mutation: CreatePartnerMutation,
            variables: {
              partner_code: this.code_input,
              name: this.name_input,
            },
          })
          .then((response) => {
            this.items.push({
              c_id: id,
              id: response.data.createPartner.id,
              partner_code: response.data.createPartner.partnerCode,
              name: response.data.createPartner.name,
            })
            this.isBusy = false
            this.totalRows = this.items.length
            this.resetModal()
            this.toast('New partner was created successfully')
          })
      } else {
        this.items[this.select_id].partner_code = this.code_input
        this.items[this.select_id].name = this.name_input
        this.$bvModal.hide('partner_modal')
        const index = this.items[this.select_id].id
        await this.$apollo
          .mutate({
            mutation: UpdatePartnerMutation,
            variables: {
              id: index,
              partner_code: this.code_input,
              name: this.name_input,
            },
          })
          .then((response) => {
            this.resetModal()
            this.toast('Partner was updated successfully')
          })
      }
    },
    async partner_delete() {
      if (!confirm('Are you sure you want to delete this item?')) {
        return
      }
      this.isBusy = true
      this.$bvModal.hide('partner_modal')
      const index = this.items[this.select_id].id
      await this.$apollo
        .mutate({
          mutation: DeletePartnerMutation,
          variables: {
            id: index,
          },
        })
        .then((result, loading) => {
          if (!loading) {
            this.getPartnerList()
            this.toast('The selected partner was deleted successfully!')
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
      this.code_input = ''
      this.name_input = ''
    },
  },
}
</script>
