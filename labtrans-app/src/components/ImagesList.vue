<template>
  <ul class="images" v-if="images.length > 0">
		<li class="images__item" v-bind:class="{ active: currentImage.id === image.id }" v-for="(image) in images" v-bind:key="image.id" @click="changeImage(image)">
			<a title="Sem marcações" v-if="!image.processed">
					<svg width="16px" height="16px" viewBox="0 0 16 16" fill="#fbc937" xmlns="http://www.w3.org/2000/svg">
							<path fill-rule="evenodd" d="M8.982 1.566a1.13 1.13 0 00-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5a.905.905 0 00-.9.995l.35 3.507a.552.552 0 001.1 0l.35-3.507A.905.905 0 008 5zm.002 6a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/>
					</svg>
			</a>

			<a title="Sem marcações" v-if="image.processed">
					<svg width="16px" height="16px" viewBox="0 0 16 16" fill="#42d268" xmlns="http://www.w3.org/2000/svg">
							<path fill-rule="evenodd" d="M3 3a2 2 0 012-2h6a2 2 0 012 2v12l-5-3-5 3V3z" clip-rule="evenodd"/>
					</svg>
			</a>            
			<img v-bind:src="image.path" />
		</li>
  </ul>
</template>

<script>
	export default {
		name: 'App',
		props: {
			images: Array,
			currentImage: Object,
		},
		mounted() {

		},
		methods: {
			changeImage(image) {				
				this.$emit('changeImage', image)
			}
		}
	}
</script>

<style lang="scss">
    .images{
			display:flex;
			list-style: none;
			width: 800px;
			left: 50%;
			position: relative;
			margin: 54px 0 0 -440px;
    }

    .images__item{
			margin-right: 10px;
			width: 120px;
			transition: all .1s linear;
			cursor: pointer;
			position: relative;			

			&:hover{
					filter: brightness(.7);
			} 

			&.active{
				filter: brightness(.5);
			}

			img{
					display: block;
					width: 100%;
					border-radius: 2px;
			}

			svg{
					position: absolute;
					right: 2px;
					top: 2px;
			}
    }
</style>