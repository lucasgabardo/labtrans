<template>
  <div id="canvasWrapper">
    <div class="image__name">
      <h1>{{image.name}}</h1>
      <button @click="saveImage()" class="markup__button">SALVAR</button>
    </div>

    <div id="onboardingWrapper" class="onboarding-wrapper">
      <Onboarding v-if="!this.$cookie.get('onboarding')"/> 

      <div class="markup__edit-wrapper" v-for="(markup) in markups" v-bind:key="markup.id">
        <div v-if="!markup.saved">
          <div class="markup__edit" v-bind:class="{ hide: mousedown }" v-bind:style="{'background': markup.color, 'left': markup.position.mousex + 'px', 'top': markup.position.last_mousey + 'px'}">         
            <div class="markup__edit-title">
              <span>Adicionar marcação</span>            
              <button class="markup__close" @click="removeRectangle(markup.id)">
                <md-icon class="icon--close-edit">close</md-icon>
              </button>
            </div>
            
            <div class="markup__input-wrapper">
              <input focus v-bind:id="'input-' + markup.id" type="text" class="markInput" @keyup="changeMarkupName($event, markup.id)"/>
              <div class="markup__color-picker">
                <button class="markup__color-picker__picked" v-bind:style="{ 'background-color': markup.color}"></button>
                <div class="markup__color-picker__colors" >
                  <button @click="changeColor(markup.id, color)" v-for="color in colors" v-bind:key="color" v-bind:class="{ active: color === markup.color }" v-bind:style="{ 'background-color': color}" n></button>
                </div>                
              </div>
              <button class="markup__button" @click="saveMarkup(markup.id)">OK</button>
            </div>
          </div>
        </div>

        <div class="markup__saved" 
          v-if="markup.saved" 
          v-bind:style="{ 
            'left': (markup.position.last_mousex > markup.position.mousex ? markup.position.mousex : markup.position.last_mousex) + 'px', 
            'top': markup.position.last_mousey + 'px',
            'width': (markup.position.last_mousex > markup.position.mousex ? (markup.position.last_mousex - markup.position.mousex) : (markup.position.mousex - markup.position.last_mousex)) + 'px',
            'background-color': markup.color}">
            
          {{markup.description}}
          <a alt="Remover marcação" @click="removeMarkup(markup.id)">
            <md-icon class="icon--close">close</md-icon>
          </a>
        </div>
      </div>

      <div id="canvasBg" v-bind:class="{ fog: mousedown }"></div>
      <canvas id="canvas" width="800" height="400"></canvas>
    </div>
  </div>
</template>

<script>
  import Onboarding from './Onboarding.vue'
  
  export default {
    name: 'Canvas',
    components:{
      Onboarding
    },
    props:{
      image: Object,
      currentMarkups: Array
    },
    data(){
      return{
        canvas: null,
        canvasBg: null,
        markups: this.currentMarkups ? this.currentMarkups : [],
        mousedown: null,
        colors: ["#4285f4", "#ea4335", "#fbbc05", "#34a853"]
      }    
    },
    mounted() {
      if(this.image && this.image.path){
        this.canvas = document.getElementById('canvas');
        this.canvasBg = document.getElementById('canvasBg');
        this.canvasWrapper = document.getElementById('canvasWrapper');
        const ctx = this.canvas.getContext('2d');
        let currentMarkupId = null;
        const background = new Image();
        background.src = this.image.path;

        const drawMarkup = (markup) => {
          ctx.beginPath();
          const width = markup.position.mousex - markup.position.last_mousex;
          const height = markup.position.mousey - markup.position.last_mousey;
          ctx.rect(markup.position.last_mousex, markup.position.last_mousey, width, height);
          ctx.strokeStyle = markup.color;
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.drawImage(background,
          markup.position.last_mousex,markup.position.last_mousey,
          markup.position.mousex - markup.position.last_mousex,
          markup.position.mousey - markup.position.last_mousey,
          markup.position.last_mousex, markup.position.last_mousey, markup.position.mousex - markup.position.last_mousex,
          markup.position.mousey - markup.position.last_mousey);               
      }

        if(this.currentMarkups){
          console.log('this.currentMarkups', this.currentMarkups)
          this.markups = this.currentMarkups.map((m) => { 
            if(typeof m.position === "string"){
              m.position = JSON.parse(m.position.replace(/'/g, '"'));                            
            }         
            m.saved = true;
            drawMarkup(m)               
            return m;
          });                               
        }
        
        //Setting image
        this.canvasBg.style.backgroundImage = 'url(' + this.image.path + ')';

        //Mouse position
        let canvasx = this.canvasWrapper.offsetLeft;
        let canvasy = this.canvasWrapper.offsetTop + 40;
        let last_mousex = 0;
        let last_mousey = 0;
        let mousex = 0;
        let mousey = 0;

        this.canvas.addEventListener('mousedown', (e) => {
          last_mousex = parseInt(e.clientX-canvasx);
          last_mousey = parseInt(e.clientY-canvasy);
          this.mousedown = true;
          currentMarkupId = Math.floor(Math.random() * 999999);
          this.markups.push({
            id: currentMarkupId, 
            color: '#4285f4',
            position: {
              mousex: mousex, 
              mousey: mousey, 
              last_mousex: last_mousex, 
              last_mousey: last_mousey
            }
          });                
        });

        this.canvas.addEventListener('mouseup', () => {
          this.mousedown = false;
          this.markups[this.markups.length - 1].done = true;
          setTimeout(() => {
              document.getElementById('input-' + currentMarkupId).focus();        
          }, 200)
        });

        this.canvas.addEventListener("mouseout", () => {
            this.mousedown = false;
        });       

        this.canvas.addEventListener('mousemove', (e) => {          
          mousex = parseInt(e.clientX-canvasx);
          mousey = parseInt(e.clientY-canvasy);
                 
          
          if(this.mousedown) {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
              this.markups.forEach((m) => {
                if(m.id === currentMarkupId && !m.done){
                  m.position.mousex = mousex;
                  m.position.mousey = mousey;
                }
              });

              this.markups.forEach((markup) => { 
                drawMarkup(markup);   
              });
          }
        });
      }            
    },
    methods: {      
      updateCanvas() {
        this.mousedown = true;
        this.canvas.dispatchEvent(new Event('mousemove'));
        this.mousedown = false;
      },
      removeRectangle(markupId) {
        this.markups = this.markups.filter((r) => r.id !== markupId)
        this.updateCanvas();         
      },
      changeMarkupName(event, markupId) {
         this.markups.forEach((m) => {
          if(m.id === markupId){
            m.description = event.target.value;
          }      
        })
      },
      removeMarkup(markupId) {
         this.markups = this.markups.map((m) => {
          if(m.id !== markupId){
            return m;
          }      
        }).filter((f) => typeof f !== 'undefined')
        this.updateCanvas();
        this.$emit('checkChanged', this.markups);  
      },
      saveMarkup(markupId){
        this.markups = this.markups.map((m) => {
          if(m.id === markupId){
            m.saved = true;           
          }
          return m;
        });
        this.$emit('checkChanged', this.markups);
      },
      changeColor(markupId, color){
        this.markups = this.markups.map((m) => {
          if(m.id === markupId){
            m.color = color;    
          }
          return m;
        });
        this.updateCanvas();        
      },
      saveImage() {				
				this.$emit('saveImage', this.markups)
			}
    }    
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  .onboarding-wrapper{
    position: relative;
    z-index: 4;
  }

  #canvas {
    position: relative;
    z-index: 2;    
  }

  #canvasBg{
    position: absolute;
    transition: all .25s ease-in-out;
    width: 800px;
    height: 400px;
    opacity: .7;
    border-radius: 2px;
  }

  #canvasBg.fog{
    opacity: .5;
  }

  #canvasWrapper{
    position: relative;
    width: 800px;
    height: 400px;
    left: 50%;
    margin: 0 0 0 -400px;
    background-color: #fff;
  }

  .markup__edit{
    position: relative;
    background-color: #4285f4;
    padding: 5px 6px 6px 6px;
    margin-left: 1px;
    margin-top: -2px;
    color: #fff;
    z-index: 3;

    &-wrapper{
      position: absolute;
    }
  }

  .hide{
    display: none;
  }

  .markup__saved{
    position: absolute;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    background-color: red;
  }

  .markup__button{
    background-color: transparent;
    border: 1px solid #fff;
    font-size: 12px;
    padding: 2px 5px;
    color: #fff;   

    &:hover{
      background-color: #fff;
      color: #2d2d2d;
      cursor: pointer;
    }      
  }


  .markup__input-wrapper{
    display: flex;  
    position: relative;

    input{
      height: 25px;
      padding: 5px 26px 5px 5px;
      border: none;
      width: 150px;
      margin-right: 5px;
    }
  }

  .markup__edit-title{
    margin: 0 0 5px 0;
  }

  .markup__close{
    position: absolute;
    top: -1px;
    right: -3px;
    background-color: transparent;
    border: none;
    color: #fff;
    cursor: pointer;
  }

  .markup__color-picker{
    position: absolute;
    bottom: -1px;
    right: 37px;

    &:hover{
      .markup__color-picker__colors{
        display: block;
      }
    }

    button{
      width: 19px;
      height: 19px;
      border: none;
      cursor: pointer;
    }
  }

  .markup__color-picker__colors{
    display: none;
    top: 22px;
    background-color: #fff;
    position: absolute;
    padding: 5px;
    left: -5px;
    -webkit-box-shadow: 2px 2px 5px -2px rgba(0,0,0,0.6);

    &:after{
      bottom: 100%;
      left: 50%;
      border: solid transparent;
      content: " ";
      height: 0;
      width: 0;
      position: absolute;
      pointer-events: none;
      border-color: rgba(255, 255, 255, 0);
      border-bottom-color: #ffffff;
      border-width: 5px;
      margin-left: -5px;
    }

    &:hover{
      display: block;
    }
  }

  .markup__saved{
    width: 301px;
    padding: 2px 14px 2px 2px;
    color: #fff;
    position: relative;
    z-index: 3;
  }

  .image__name{
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 10px 10px 10px;
    background-color: #393b21;
    color: #fff;
    margin-bottom: 0px;
    border-radius: 2px 2px 0 0;

    h1{
      align-self: flex-start;
      margin: 0 auto 0 0;
      font-size: 16px;
      position: relative;
      top: 2px;
    }

    button{
      padding-left: 10px;
      padding-right: 10px;
    }
  }

  i.icon{
    &--close{
      font-size: 14px !important;
      color: #fff !important;
      right: -5px;
      position: absolute;
      top: 0;
      cursor: pointer;
    }

    &--close-edit{
      font-size: 14px !important;
      color: #fff !important;
      right: 1px;
      position: absolute;
      top: 1px;
      cursor: pointer;
    }
  }
</style>
