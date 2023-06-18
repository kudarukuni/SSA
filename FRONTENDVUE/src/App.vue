<template>
  <div id="app">
    <div class="container">
      <form enctype="multipart/form-data" novalidate v-if="isInitial || isSaving">
        <h1 align="center"><b><strong>Upload Documents</font></strong></b></h1>
        <div class="dropbox">
          <input type="file" multiple :name="uploadFieldName" :disabled="isSaving" @change="filesChange($event.target.name, $event.target.files); fileCount = $event.target.files.length"
            accept="application/pdf" class="input-file">
            <p v-if="isInitial"><br>Drag Your File(s) Here To Begin.<br>Or<br>Click To Browse.</p>
            <br>
            <p v-if="isSaving">Uploading {{ fileCount }} File(s), Please Wait ....</p>
        </div>
      </form>
      <div v-if="isSuccess">
        <h2 align="right"><font color="green">Document Was Uploaded Successfully !!</font></h2>        
        <ul class="list-unstyled">
          <li v-for="item in uploadedFiles">
            <img :src="item.url" class="img-responsive img-thumbnail" :alt="item.originalName"><p><a href="javascript:void(0)" @click="reset()">Reset...</a></p>
          </li>
        </ul>
      </div>
      <div v-if="isFailed">
        <h2 align="right"><font color="red">Failed To Upload Document !!</font></h2>
        <p><a href="javascript:void(0)" @click="reset()">Please Try Again...</a></p>
        <pre><p><strong><b>Wangu, panoda maPDF chete !!</b></strong></p></pre>
      </div>
    </div>
  </div>
</template>
<script>
  import { upload } from './file-upload.service';
  import { wait } from './utils';
  const STATUS_INITIAL = 0, STATUS_SAVING = 1, STATUS_SUCCESS = 2, STATUS_FAILED = 3;
  export default {
    name: 'app',
    data() {
      return {
        uploadedFiles: [],
        uploadError: null,
        currentStatus: null,
        uploadFieldName: 'photos'
      }
    },
    computed: {
      isInitial() {
        return this.currentStatus === STATUS_INITIAL;
      },
      isSaving() {
        return this.currentStatus === STATUS_SAVING;
      },
      isSuccess() {
        return this.currentStatus === STATUS_SUCCESS;
      },
      isFailed() {
        return this.currentStatus === STATUS_FAILED;
      }
    },
    methods: {
      reset() {
        this.currentStatus = STATUS_INITIAL;
        this.uploadedFiles = [];
        this.uploadError = null;
      },
      save(formData) {
        this.currentStatus = STATUS_SAVING;
        upload(formData)
          .then(wait(1500))
          .then(x => {
            this.uploadedFiles = [].concat(x);
            this.currentStatus = STATUS_SUCCESS;
          })
          .catch(err => {
            this.uploadError = err.response;
            this.currentStatus = STATUS_FAILED;
          });
      },
      filesChange(fieldName, fileList) {
        const formData = new FormData();
        if (!fileList.length) return;
        Array
          .from(Array(fileList.length).keys())
          .map(x => {
            formData.append(fieldName, fileList[x], fileList[x].name);
          });
        this.save(formData);
      }
    },
    mounted() {
      this.reset();
    },
  }
</script>
<style>
  .dropbox {
    outline: 2px dashed grey;
    outline-offset: -10px;
    background: lightcyan;
    color: dimgray;
    padding: 10px 10px;
    min-height: 200px;
    position: relative;
    cursor: pointer;
  }  
  .input-file {
    opacity: 0;
    width: 100%;
    height: 200px;
    position: absolute;
    cursor: pointer;
  }  
  .dropbox:hover {
    background: lightblue;
  }  
  .dropbox p {
    font-size: 1.2em;
    text-align: center;
    padding: 50px 0;
  }
</style>