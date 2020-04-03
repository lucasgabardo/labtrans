<template>
  <div class="app">
      <Canvas 
        :currentMarkups="currentMarkups" 
        :image="currentImage" 
        v-on:saveImage="(markups) => saveImage(markups)"
        v-on:checkChanged="(markups) => changed = markups"
        :key="JSON.stringify(currentImage)+JSON.stringify(currentMarkups)"
      />
      <ImagesList 
        :images="images"
        :currentImage="currentImage"
        v-on:changeImage="(image) => changeImage(image)"
        :key="'list-'+JSON.stringify(currentImage)"
      />
      <md-snackbar class="snackbar--success" :md-position="'center'" :md-duration="2000" :md-active.sync="showSnackbar" md-persistent>
        <span>{{snackbarMessage}}</span>
      </md-snackbar>

      <md-dialog :md-active.sync="showNotSavedDialog">
        <md-dialog-title>Atenção</md-dialog-title>

        <p class="dialog-text">Você deseja salvar as alterações realizadas?</p>

        <md-dialog-actions>
          <md-button class="md-primary" @click="confirmChange(false)">Não</md-button>
          <md-button class="md-primary" @click="confirmChange(true)">Sim</md-button>
        </md-dialog-actions>
      </md-dialog>
  </div>
</template>

<script>
import Canvas from './components/Canvas/Canvas.vue';
import ImagesList from './components/ImagesList.vue';
import axios from 'axios';


export default {
  name: 'App',
  components: {
    Canvas,
    ImagesList
  },
  data() {
    return {
      images: [],
      markups: [],
      currentImage: null,
      currentMarkups: null,
      canvasKey: 0,
      showSnackbar: false,
      snackbarMessage: null,
      showNotSavedDialog: null,
      changed: false,
      imageToChange: false
    }
  },
  mounted() {
    this.getImages();    
  },
  methods: {
    getImages(){
        axios
        .get('http://localhost:3000/api/image')
        .then((response) => {              
          this.images = response.data;
          if(this.images.filter((i) => !i.processed).length){
            this.currentImage = this.images.filter((i) => !i.processed)[0]
          }else if(!this.currentImage){
            this.currentImage = this.images[0];
          }
          
          axios
            .get('http://localhost:3000/api/item')
            .then((response) => {                                  
              this.markups = response.data;
              this.currentMarkups = this.markups.filter((m) => parseInt(m.imageId) === this.currentImage.id);
            })
            .catch((e) => {
              console.error('Erro ao buscar marcações', e);
              this.markups = [];
              this.currentMarkups = [];
            })          
      })
    },
    confirmChange(save) {
      if(save){
        this.saveImage(this.changed);
        this.currentImage = this.imageToChange;
      }else{
        this.showNotSavedDialog = false;
        this.currentImage = this.imageToChange;
        this.currentMarkups = this.markups.filter((m) => parseInt(m.imageId) === this.currentImage.id);
        this.changed = false;
      }
    },
    changeImage(image) {        
      if(this.changed){
        this.showNotSavedDialog = true;
        this.imageToChange = image;
      }else{
        this.currentImage = image;
        this.currentMarkups = this.markups.filter((m) => parseInt(m.imageId) === this.currentImage.id);
        this.changed = false;
      }          
    },
    prepareMarkupObject(markup, type){
      let newMarkup =  {...markup };
      if(type !== 'delete'){
        delete newMarkup.id;      
      }
      newMarkup.position = JSON.stringify(newMarkup.position);  
      newMarkup.imageId = this.currentImage.id.toString();
      delete newMarkup.done;
      delete newMarkup.saved
      return newMarkup;
    },
    saveImage(savedMarkups){  
      this.showNotSavedDialog = false;    
      this.changed = false;
      const newMarkups = savedMarkups.map((sm) => {
        if(!this.markups.filter((m) => m.id === sm.id).length){           
          return this.prepareMarkupObject(sm);
        }        
      }).filter((f) => typeof f !== "undefined");

      const deletedMarkups = this.markups
      .filter((m) => parseInt(m.imageId) === parseInt(this.currentImage.id))
      .map((m) => {
        if(!savedMarkups.filter((sm) => (m.id === sm.id)).length){           
          return this.prepareMarkupObject(m, 'delete');
        }        
      }).filter((f) => typeof f !== "undefined");
      
      this.saveRequests(newMarkups, deletedMarkups)
    },
    saveRequests(newMarkups, deletedMarkups){
      if(newMarkups.length){
        axios.post('http://localhost:3000/api/item', newMarkups)
          .then(() => { 
            this.getImages();
            this.snackbarMessage = "Imagem salva com sucesso";
            this.showSnackbar = true;        
          })
          .catch(() => {
            console.error('Erro ao salvar imagem');
          })
      }else{
        this.snackbarMessage = "Nenhuma alteração foi feita";
        this.showSnackbar = true;        
      }
      console.log('deletedMarkups.length', deletedMarkups)
      if(deletedMarkups.length){
         if(deletedMarkups.length){
          axios.delete('http://localhost:3000/api/item', 
            {data:deletedMarkups})
            .then(() => {
              this.snackbarMessage = "Imagem salva com sucesso";
              this.showSnackbar = true;        
            })
            .catch(() => {
              console.error('Erro ao salvar imagem');
            })
        }else{
          this.snackbarMessage = "Nenhuma alteração foi feita";
          this.showSnackbar = true;        
        }
      }

      const newImage = {...this.currentImage};
      newImage.processed = true;
      newImage.id = newImage.id.toString();
      axios.put('http://localhost:3000/api/image', newImage)
        .then(() => { 
          console.log('Imagem atualizada');    
          this.getImages();  
        })
        .catch(() => {
          console.error('Erro ao salvar imagem');
        })
    }
  }
}
</script>

<style lang="scss">
  .app{
    background-image: url('./assets/bg.jpg');
    background-size: cover; 
    font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","Roboto", sans-serif;
    font-size: 13px;
    padding: 50px 0;
    height: 100vh;
    overflow: hidden;
  }

  .dialog-text{
    padding: 0 20px;
    margin-top: 0;
  }
  
  .snackbar--success{
    background-color: #34a853 !important;
  }
</style>