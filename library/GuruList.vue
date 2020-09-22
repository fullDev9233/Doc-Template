<template>
  <b-container>
    <!-- Filter and Add Partner -->
    <b-row class="mb-3">
      <b-col lg="6" class="my-1">
        <b-form-group
          :state="file.length > 0"
          invalid-feedback="Please select files to upload"
        >
          <b-form-file
            ref="formfile"
            v-model="file"
            accept="image/*"
            multiple
            :state="file.length > 0"
          >
            <template slot="file-name" slot-scope="{ names }">
              <b-badge variant="dark">{{ names[0] }}</b-badge>
              <b-badge v-if="names.length > 1" variant="dark" class="ml-1">
                + {{ names.length - 1 }} More files
              </b-badge>
            </template>
          </b-form-file>
        </b-form-group>
      </b-col>
      <b-col lg="6" class="my-1">
        <b-button class="mb-2" @click="upload_image()">
          <b-icon icon="cloud-upload" aria-hidden="true"></b-icon>
          Upload Images
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
    >
      <template v-slot:cell(delete)="row">
        <b-button size="sm" @click="delete_image(row.item, row.index)">
          <b-icon icon="trash" aria-hidden="true"></b-icon>
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
  </b-container>
</template>

<script>
import GurusQuery from '@/components/library/gurus.query.gql'
import CreateGuruMutation from '@/components/library/create_guru.mutation.gql'
import DeleteGuruMutation from '@/components/library/delete_guru.mutation.gql'
export default {
  name: 'GuruList',
  data() {
    return {
      items: [],
      fields: [
        {
          key: 'g_id',
          label: 'ID',
        },
        {
          key: 'guru_name',
          label: 'Guru Name',
          class: 'text-center',
        },
        {
          key: 'created_date',
          label: 'Created Date',
          class: 'text-center',
        },
        {
          key: 'delete',
          label: 'Delete',
          class: 'text-center',
        },
      ],
      bordered: true,
      select_id: 0,
      isBusy: true,
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [5, 10, 15],
      file: [],
    }
  },
  mounted() {
    this.getGuruList()
  },
  methods: {
    checkFormValidity() {
      return this.file.length > 0
    },
    async getGuruList() {
      this.isBusy = true
      await this.$apollo
        .query({
          query: GurusQuery,
          fetchPolicy: 'no-cache',
        })
        .then((result, loading) => {
          if (!loading) {
            let index = 1
            const gurus = []
            result.data.gurus.items.forEach((guru) => {
              gurus.push({
                g_id: index,
                guru_name: guru.uploadedFileName,
                created_date: guru.createdDate,
                id: guru.id,
              })
              index++
            })
            this.items = gurus
            this.isBusy = false
            this.totalRows = this.items.length
          }
        })
    },
    async upload_image() {
      if (!this.checkFormValidity()) {
        return
      }
      await this.$apollo
        .mutate({
          mutation: CreateGuruMutation,
          variables: {
            files: this.file,
          },
        })
        .then((result, loading) => {
          if (!loading) {
            this.getGuruList()
            this.file = []
            this.toast('Uploaded successfully')
          }
        })
    },
    async delete_image(partner, idx) {
      if (!confirm('Are you sure you want to delete this item?')) {
        return
      }
      this.isBusy = true
      const index = this.items[this.select_id].id
      await this.$apollo
        .mutate({
          mutation: DeleteGuruMutation,
          variables: {
            id: index,
          },
        })
        .then((result, loading) => {
          if (!loading) {
            this.getGuruList()
            this.toast('Guru was deleted successfully!')
          }
        })
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
  },
}
</script>
