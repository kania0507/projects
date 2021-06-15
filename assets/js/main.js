// Create route components
const ProjectDetails = {
    template: `<div class="content">
    <div v-if='this.obj' class="box-details">
        <nav>
            <router-link to="/" class="p_2"><i class="fas fa-chevron-left"></i> <u>Back to list of projects</u></router-link> 
        </nav>

        <h1>{{ obj.name }}  <small class="pull-right"><a v-if="this.obj.ghlink" :href="this.obj.ghlink" title="Code on Github"><i class="fa fab fa-github "></i></a>  
        <a :href="obj.link" title="Demo"><i class="fa fa-link" ></i></a></small></h1> 
        <h2>{{ this.obj.desc }}</h2>
        <span class="box-cat" v-for="cat in this.obj.category">{{ cat }}</span>
        <p class="p-img"  :class="{ hide: this.obj.photo == ''}"><img   :src="'./assets/img/'+this.obj.photo"  class="img-responsive"   /></p> 
        
    </div>
    <div class="button-holder"><button style="float:left"><span>Prev project</span></button> 
        <button style="float:right"><span>Next project</span></button></div>
    </div>`,
    data() { 
            return {    
                obj: {}
            }
        },
    created() {
        this.obj = this.$route.params; 
        //console.log('this obj: '+this.obj.name);
        }, 
 
}


const Project = { template: `  
    <router-link v-if="propObj" :to="{name: 'ProjectDetails', path: '/projects/'+propObj.id, params: propObj }">
        <div class="inbox">
            <h1>{{ propObj.name }} </h1>  
            <p  :class="{ hide: propObj.photo == ''}" > <img    :src="'./assets/img/'+propObj.photo"  class="img-responsive" /></p>  
        </div>
        </router-link>
    `,
    data() { 
        return {    
            id: 0
        }
    },
    props: { 
        propObj: { type: Object, required: true },
    }
}
 

const Projects = {
    template: `
    <div class="content"> 
        
        <div class="wrapper-header">
            <ul class="category">
            <li v-bind:class="{ active: currentFilter === 'all' }" @click.prevent="setFilter('all')">ALL</li>
            <li v-for="(cat, index) in this.categories" class="cat"  :class="{ active: currentFilter === cat }" @click.prevent="setFilter(cat)"  >{{ cat}}</li>
            </ul>
        </div>
        <main class="wrapper" v-if="loading"> 
            <div class="loading">😴 Loading data ...</div> 
        </main>
        <main  class="wrapper" v-else>
            <div v-for="(project,index) in projectsList"  v-if="(project.category.includes(currentFilter) || currentFilter === 'all')">
                <div class="box php laravel psd"  >
                    <Project :propObj=project></Project> 
                </div> 
            </div>  
        </main>
        <div class="button-holder" v-if="!projectsList || projectsList.length < projects.length"><button @click.prevent="loadMore()"><span>Load more</span></button></div>

    </div>
    `, 
    data() { 
        return {
            projects: [], 
            skills: [],
            projectsCount: 8,
            perPage: 4,
            page: 1,
            loading : true,
            errors: false, 
            categories: [],  
            filter: 'all',   
            currentFilter: 'all',  
            id:null,
            projectsList:null,
            
            }
    },
    props: {
        anObject: Object
     },
    components: {
        Project, ProjectDetails
      },
     
    methods:{
        fetchData: function () { // https://api.github.com/users/fbhood/repos?per_page=${this.perPage}&page=${this.page}
            axios.get(`./assets/data.json`, {
                params: {
                    per_page:this.perPage,
                    page:this.page
                 }
              } )
                .then(response => {
                 if(response.data !='' ) {  
                    this.projects = response.data.projects.project;     
                    
                    this.projects.forEach( project => {
                        this.skills.push( project.category ); 
                        
                    }); 
                    this.categories = this.categories.concat(this.skills).flat(2); 
                    this.categories = this.categories.filter((item,index)=>{   return (this.categories.indexOf(item) == index)});  
                 }
                })
                .catch(error => { 
                    //console.log(error);
                    this.errors = true;
            }).finally( ()=> {
                this.loading = false;
                this.getProjects();
                //console.log('finally '+this.projectsList);
            })
        }, 
        getProjects(){
            this.projectsList = this.projects.slice(0, this.projectsCount);
            return this.projectsList;
        },
        loadMore(){
            if(this.projectsList.length <= this.projects.length ) {
                this.projectsCount += 4;
                this.getProjects(); 
            }
        }, 
        setFilter: function(filter) {
            this.currentFilter = filter;
          }, 
    },
    mounted(){
      setTimeout(this.fetchData, 1000);
    }
    
}

// Define routes 
const routes = [
    {   path: '/', component: Projects  }, 
    {   path: '/projects/:id', component: ProjectDetails, name: 'ProjectDetails', props: true, params: true   }
];


// create the router instance
const router = new VueRouter({
    //mode: 'history',
    routes
})

// create and mount the vue instance 
const app = new Vue({
    router
}).$mount('#app')