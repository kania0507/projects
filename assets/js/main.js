// Create route components
const ProjectDetails = {
    template: `<div class="content">
    <div v-if='obj' class="box-details">
        <nav>
            <router-link to="/" class="p_2"><i class="fas fa-chevron-left"></i> <u>Back to list of projects</u></router-link> 
        </nav>

        <h1>{{ obj.name }}  <small class="pull-right"><a :class="{ hide: obj.ghlink == ''}"  :href="obj.ghlink" title="Code on Github"><i class="fa fab fa-github "></i></a>  
        <a :class="{ hide: (obj.link == '' || obj.link == '#') }" :href="obj.link" title="Demo"><i class="fa fa-link" ></i></a></small></h1> 
        <h2>{{ obj.desc }}</h2>
        Technologies: <span class="box-cat" v-for="cat in obj.category"> {{ cat }}</span>
        <p class="p-img"  :class="{ hide: obj.photo == ''}"><img   :src="'./assets/img/'+obj.photo"  class="img-responsive"   /></p> 
        
    </div>
    <div class="button-holder" :class="{ hide: prjCount == 1}"><router-link v-if="obj && indexPrev >= 0" :to="{name: 'ProjectDetails',  params: {id: ($route.params.allProjects[indexPrev].id), propObj: $route.params.allProjects[indexPrev], prjCount: prjCount, allProjects: $route.params.allProjects, cat: $route.params.cat}}" replace><button style="float:left" ><span>Prev project</span></button></router-link>
        <router-link v-if="obj && indexNext < parseInt($route.params.allProjects.length)" :to="{name: 'ProjectDetails',  params: {id: ($route.params.allProjects[indexNext].id), propObj: $route.params.allProjects[indexNext], prjCount: prjCount, allProjects: $route.params.allProjects, cat: $route.params.cat} }" replace><button style="float:right"><span>Next project</span></button></router-link></div>
    </div>`,
    data() { 
            return {    
                obj: {}, 
                prjCount: 0
            }
        },
    methods: {
       
    },
    created() {
        this.obj = this.$route.params.propObj;  
        this.prjCount = this.$route.params.prjCount;
    },
    computed: {
        indexPrev () {
            return this.$route.params.allProjects.findIndex(el => parseInt(el.id) === parseInt(this.obj.id)) - 1
        },
        indexNext () {
            return (this.$route.params.allProjects.findIndex(el => parseInt(el.id) === parseInt(this.obj.id)) + 1)
        }
        
    }
}


const Project = { template: `  
    <router-link v-if="propObj" :to="{name: 'ProjectDetails', path: '/projects/'+ propObj.id, params: {id: propObj.id, propObj:propObj, prjCount:prjCount, allProjects: cat === 'all' ? allProjects : allProjects.filter(el => el.category.includes(cat)), cat: cat } }">
        <div class="inbox">
            <h1>{{ propObj.name }} </h1>  
            <p  :class="{ hide: propObj.photo == ''}" > <img  v-if="propObj.photo != ''"  :src="'./assets/img/'+propObj.photo"  class="img-responsive" /></p>  
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
        prjCount: { type: Number},
        allProjects: { type: Array, required: false },
        cat: { type: String }
    }
}
 

const Projects = {
    template: `
    <div class="content"> 
        
        <div class="wrapper-header">
            <ul class="category">
                <li v-bind:class="{ active: currentFilter === 'all' }" @click.prevent="setFilter('all')">ALL</li>
                <li v-for="(cat, index) in this.categories" class="cat"  :class="{ active: currentFilter === cat }" @click.prevent="setFilter(cat)" >{{ cat }}</li>
            </ul>
        </div>
        <main class="wrapper" v-if="loading"> 
            <div class="loading">😴 Loading data ...</div> 
        </main>
        <main  class="wrapper" v-else>
            <div v-for="(project,index) in projectsList"  v-if="(project.category.includes(currentFilter) || currentFilter === 'all')">
                <div class="box php laravel psd">
                    <Project :propObj=project :prjCount=projects.length :allProjects=projects :cat=currentFilter></Project> 
                </div> 
            </div>  
        </main>
        <div class="button-holder" v-if="!loading &&  projectsList.length < maxProjectsCount"><button @click.prevent="loadMore()"><span>Load more</span></button></div>
    </div>
    `, 
    data() { 
        return {
            projects: [], 
            skills: [],
            projectsCount: 12,
            perPage: 6,
            page: 1,
            loading : true,
            errors: false, 
            categories: [],  
            filter: 'all',   
            currentFilter: 'all',  
            id: null,
            projectsList: null
        }
    },
    components: {
        Project, ProjectDetails
      },
     
    methods:{
        fetchData () { 
            axios.get(`./assets/data.json`, {
                params: {
                    per_page: this.perPage,
                    page: this.page
                 }
              })
            .then(response => {
                if(response.data !=='' ) {  
                this.projects = response.data.projects.project;     
                
                this.projects.forEach( project => {
                    this.skills.push(project.category); 
                    
                }); 
                this.categories = this.categories.concat(this.skills).flat(2); 
                this.categories = this.categories.filter((item, index) => { return (this.categories.indexOf(item) === index) });  
                }
            })
            .catch(error => {
                this.errors = true;
            }).finally(()=> {
                this.loading = false;
                this.getProjects();
            })
            
        }, 
        getProjects () {
            return this.projectsList = (this.currentFilter === 'all' ? this.projects.slice(0, this.projectsCount) : this.projects.filter(el => el.category.includes(this.currentFilter)));
        },
        loadMore () {
            if(this.projectsList.length <= this.projects.length ) {
                this.projectsCount += this.perPage;
                this.getProjects(); 
            }
        }, 
        setFilter (filter) {
            this.currentFilter = filter;
            this.getProjects();
          }, 
    },
    mounted () {
      setTimeout(this.fetchData, 1000);
      if (location.hash) {
        location.replace(location.hash.replace('#', ''))
      }
     
    },
    computed: {
        maxProjectsCount () {
            return this.projects ? (this.currentFilter !== "all" ? this.projects.filter(el => el.category.includes(this.currentFilter)).length : this.projects.length): this.projectsCount
        }
    }
}

// Define routes 
const routes = [
    {   path: '/', component: Projects  }, 
    {   path: '/projects/:id', component: ProjectDetails, name: 'ProjectDetails', params: true   }
];


// create the router instance
const router = new VueRouter({
    mode: 'history',
    routes
})

// create and mount the vue instance 
const app = new Vue({
    router
}).$mount('#app')
