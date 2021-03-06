/**
 * load vue, axios, toastr
 */
import axios from 'axios'
import Vue from 'vue'

import BootstrapVue from 'bootstrap-vue'
import VModal from 'vue-js-modal'
import CxltToastr from 'cxlt-vue2-toastr'

import datepicker from 'vue2-datepicker'
import pagination from './components/pagination.vue'

Vue.use(CxltToastr);
Vue.use(VModal);
Vue.use(BootstrapVue);

/**
 * Create a fresh Vue application instance.
 */

const App = new Vue({

	el: '#target',

	created: function() {

		this.getUrlList(this.currentPage);

	},

	data: {

		urls: [],
		fillUrl: {},
		newUrl: {'long_url': '', 'short_url': '', 'lifetime': '', 'is_active': false},
		fillStatistics: [],
		fillStatisticRecord:{},
		infFlag: false,
		errors: [],

		//Information for pagination
    	totalUrls: 0,
    	perPage: 3,
    	currentPage: 1
	},

	components: { 
		datepicker,
		pagination 	
	},

	delimiters: ['${', '}'],
	
	methods: {

		getUrlList(page) {

			let url = '/urls/' + page;

			axios.get(url).then(response => {

				this.urls = response.data.urls;
				this.totalUrls = response.data.totalUrls;
				this.currentPage = page;
			});
		},

		showStatistics(statistics) {

			this.fillStatistics = statistics;

			if (typeof statistics != 'undefined') {

				this.$modal.show('statistics');

			} else {

				this.$modal.show('404-modal');

			}

		},

		editUrlStatistics(record) {

			this.fillStatisticRecord = record;

			this.$refs.edit.show();
		},

		urlActiveStatusChange(url) {

			let uri = '/urls/' + url.id + '/edit-is-active';

			this.fillUrl = url;

			axios.put(uri, this.fillUrl).then(response => {

				this.getUrlList(this.currentPage);
				this.errors	  = [];

				this.$toast.success({
    					title: 'Information',
    					message: 'Link status has changed!'
				})

			}).catch(error => {
				this.errors = error.response
			});
		},

		updateStatisticRecord(id) {

			let url = '/statistical-record/' + id + '/edit';

			axios.put(url, this.fillStatisticRecord).then(response => {

				this.getUrlList(this.currentPage);
				this.fillStatisticRecord = {};
				this.errors	  = [];

				this.$refs.edit.hide();

				this.$toast.success({
    					title: 'Information',
    					message: 'This record updated!'
				})

			}).catch(error => {

				this.errors = error.response
			});
		},

		deleteStatisticRecord(id) {

			let url = '/statistical-record/delete/' + id;

			axios.delete(url).then(response => { 

				this.getUrlList(this.currentPage);

				this.$toast.error({
    				title: 'Information',
    				message: 'Record was deleted'
				})

			});
		},

		sendLongUrl() {

			let url = '/add-url';

			if (!this.infFlag ) {

				this.newUrl.lifetime = null;

			}

			axios({
					method: 'post',
					url: url,
					data: {
						long_url: this.newUrl.long_url,
						lifetime: this.newUrl.lifetime,
						is_active: this.newUrl.is_active[0]
					}
				}).then(response => {
					this.getUrlList(this.currentPage);
					this.newUrl = {'long_url': '', 'short_url': '', 'lifetime': '', 'is_active': false};
					this.errors = [];

					this.$toast.success({
    					title: 'Information',
    					message: 'Your url successfully shortened!'
					})

			}).catch(error => {

				this.errors = error.response

				this.$toast.error({
    				title: 'Information',
    				message: this.errors.data
				})

				console.log(this.errors.data);
			});
		},

		onReset(evt) {

		    evt.preventDefault();
		    /* Reset our form values */
		    this.newUrl.long_url = '';
		    this.newUrl.lifetime = '';
		    this.newUrl.is_active = false;
		    /* Trick to reset/clear native browser form validation state */
		    this.show = false;
		    this.$nextTick(() => { this.show = true });

		},

		onResetEditStatisticRecord(evt) {

			evt.preventDefault();
		    /* Reset our form values */
		    this.fillStatisticRecord.timestamp = '';
		    this.fillStatisticRecord.referrer = '';
		    this.fillStatisticRecord.ip = '';
		    this.fillStatisticRecord.browser = '';
		   
		    /* Trick to reset/clear native browser form validation state */
		    this.show = false;
		    this.$nextTick(() => { this.show = true });

		},

		onCheckLifetime(evt) {

			this.infFlag = !this.infFlag;
		}

	}
});