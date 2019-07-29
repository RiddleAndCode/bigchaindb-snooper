class BigchainDBSnooper {
  constructor(baseUrl) {
    this.url = baseUrl + "/api/v1/"
  }

  queryAssets(queryString, queryType, callback) {
    if(queryType === "asset"){
      this.sendRequest("assets/?search=" + queryString, callback);
    }
    // searches metadata if nothing else has been selected
    else {
      this.sendRequest("metadata/?search=" + queryString, callback)
    }
  }

  getTransactions(assetId, callback) {
    this.sendRequest("transactions?asset_id=" + assetId, callback);
  }

  sendRequest(path, callback) {
    let request = new XMLHttpRequest();

    request.onreadystatechange = () => {

      // Check if the request succeeded
      if (request.status === 200 && request.readyState === 4) {
        callback(JSON.parse(request.response));
      }
    };

    request.open('GET', this.url + path);
    request.send();
  }
}

/* global Vue */
var BDB_URL = 'http://ipdb3.riddleandcode.com:80'
const snooper = new Vue({
  el: "#snooper",
  data: {

    snooperApi: new BigchainDBSnooper(BDB_URL),
    assets: new Array(),
    transactions: new Array(),

    // Settings
    showSettings: false,
    urlInput: "",

    // Delay query
    isTyping: false,
    assetsLoading: false,
    transactionsLoading: false,

    // Transaction snooping
    currentTransaction: undefined,

    // Input fields
    searchInput: "",
    searchType: "metadata"
  },
  methods: {
    resetSearchInput() {
      this.searchInput = "";
      this.assets = new Array();
      this.transactions = new Array();
      this.currentTransaction = undefined;
    },

    onAssetQueryResponse(response) {
      this.stopLoading("assets");
      for (let asset in response) {
        console.log(JSON.stringify(response[asset].data, null, 2));
      }

      this.assets = response;
    },

    onTransactionsResponse(response) {
      this.stopLoading("transactions");
      this.transactions = response;
    },
    
    startLoading(item) {
      switch (item) {
        case "assets":
          this.assetsLoading = true;
          break;

        case "transactions":
          this.transactionsLoading = true;
          break;
      }
    },

    stopLoading(item) {
      switch (item) {
        case "assets":
          this.assetsLoading = false;
          break;

        case "transactions":
          this.transactionsLoading = false;
          break;
      }

    },

    onSearchInputChange() {
      if (this.searchInput === "") {
        this.stopLoading("assets");
        this.assets = new Array();
      }
      else {
        this.assets = new Array();
        this.startLoading("assets");
        this.isTyping = true;

        setTimeout(() => {
          this.isTyping = false;
        }, 500);
        setTimeout(() => {
          this.requestAssetQuery();
        }, 1000);
      }
    },

    changeSearchType(){
      this.onSearchInputChange();
    },

    requestAssetQuery() {
      if (!this.isTyping)
        this.snooperApi.queryAssets(this.searchInput, this.searchType, this.onAssetQueryResponse);
    },

    displayAssetTransactions(assetId) {
      this.startLoading("transactions");
      this.transactions = new Array();
      this.snooperApi.getTransactions(assetId, this.onTransactionsResponse);
    },

    displayTransactionDetails(transaction) {
      this.currentTransaction = transaction;
    },

    saveSettings() {
      this.BDB_URL = this.urlInput;
      this.snooperApi = new BigchainDBSnooper(this.urlInput);
      setTimeout(function() { this.showSettings = false; }.bind(this), 1000);
    }
  }
});
