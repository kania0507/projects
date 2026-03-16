// Create route components
const ProjectDetails = {
template: `<div class="content">
<div v-if='obj' class="box-details">

<nav>
<router-link to="/" class="p_2">
<i class="fas fa-chevron-left"></i>
<u>Back to list of projects</u>
</router-link>
</nav>

<h1>
{{ obj.name }}
<small class="pull-right">

<a :class="{ hide: obj.ghlink == ''}" :href="obj.ghlink">
<i class="fa fab fa-github"></i>
</a>

<a :class="{ hide: (obj.link == '' || obj.link == '#') }" :href="obj.link">
<i class="fa fa-link"></i>
</a>

</small>
</h1>

<h2>{{ obj.desc }}</h2>

Technologies:
<span class="box-cat" v-for="cat in obj.category">
{{ cat }}
</span>

<p class="p-img" :class="{ hide: obj.photo == ''}">
<img :src="'../assets/img/'+obj.photo" class="img-responsive"/>
</p>

</div>

<div class="button-holder" :class="{ hide: prjCount == 1}">

<router-link
v-if="obj && indexPrev >= 0"
:to="{
name:'ProjectDetails',
params:{
id: ($route.params.allProjects[indexPrev].id),
propObj:$route.params.allProjects[indexPrev],
prjCount:prjCount,
allProjects:$route.params.allProjects,
cat:$route.params.cat
}}"
replace>

<button style="float:left"><span>Prev project</span></button>

</router-link>

<router-link
v-if="obj && indexNext < parseInt($route.params.allProjects.length)"
:to="{
name:'ProjectDetails',
params:{
id: ($route.params.allProjects[indexNext].id),
propObj:$route.params.allProjects[indexNext],
prjCount:prjCount,
allProjects:$route.params.allProjects,
cat:$route.params.cat
}}"
replace>

<button style="float:right"><span>Next project</span></button>

</router-link>

</div>
</div>`,

data(){
return{
obj:{},
prjCount:0
}
},

created(){
this.obj = this.$route.params.propObj
this.prjCount = this.$route.params.prjCount
},

computed:{

indexPrev(){
return this.$route.params.allProjects.findIndex(el => parseInt(el.id) === parseInt(this.obj.id)) - 1
},

indexNext(){
return this.$route.params.allProjects.findIndex(el => parseInt(el.id) === parseInt(this.obj.id)) + 1
}

}
}



const Project = {

template:`

<router-link
v-if="propObj"
:to="{
name:'ProjectDetails',
path:'/projects/'+ propObj.id,
params:{
id:propObj.id,
propObj:propObj,
prjCount:prjCount,
allProjects: cat === 'all'
? allProjects
: allProjects.filter(el => el.category.includes(cat)),
cat:cat
}}">

<div class="inbox">

<h1>{{ propObj.name }}</h1>

<p v-if="propObj.photo_small !== ''">
<img :src="'./assets/img/'+propObj.photo_small" class="img-responsive"/>
</p>

<p v-else-if="propObj.photo !== ''">
<img :src="'./assets/img/'+propObj.photo" class="img-responsive"/>
</p>

<p v-if="cat">
<span class="box-cat" v-for="cat in propObj.category">
{{ cat }}
</span>
</p>

</div>

</router-link>
`,

props:{
propObj:{type:Object,required:true},
prjCount:{type:Number},
allProjects:{type:Array},
cat:{type:String}
}

}



const Projects = {

template:`

<div class="content">

<div class="wrapper-header">

<div class="gh-tech">

<div class="gh-bar">

<div
v-for="tech in technologiesStats"
:key="tech.name"
class="gh-bar-part"
:class="{active: currentFilter === tech.name}"
:style="{
width: tech.percent + '%',
background: getTechColor(tech.name)
}"
@click="setFilter(tech.name)">
</div>

</div>

<div class="gh-legend">

<span
class="legend-item legend-all"
:class="{active: currentFilter === 'all'}"
@click="setFilter('all')">

● ALL

</span>

<span
v-for="tech in technologiesStats"
:key="tech.name"
class="legend-item"
:class="{active: currentFilter === tech.name}"
@click="setFilter(tech.name)">

<i :style="{background:getTechColor(tech.name)}"></i>

{{ tech.name }}
{{ tech.percent.toFixed(1) }}%

</span>

</div>

</div>

</div>

<main class="wrapper" v-if="loading">
<div class="loading">😴 Loading data ...</div>
</main>

<main class="wrapper" v-else>

<div
v-for="(project,index) in projectsList"
v-if="(project.category.includes(currentFilter) || currentFilter === 'all')">

<div class="box">

<Project
:propObj="project"
:prjCount="projects.length"
:allProjects="projects"
:cat="currentFilter">
</Project>

</div>

</div>

</main>

<div
class="button-holder"
v-if="!loading && projectsList.length < maxProjectsCount">

<button @click.prevent="loadMore()">
<span>Load more</span>
</button>

</div>

</div>
`,

data(){
return{
projects:[],
projectsCount:12,
perPage:6,
page:1,
loading:true,
errors:false,
currentFilter:'all',
projectsList:null
}
},

components:{
Project,
ProjectDetails
},

methods:{

fetchData(){

axios.get('./assets/data.json')
.then(response=>{

this.projects = response.data.projects.project

})
.catch(()=>{
this.errors = true
})
.finally(()=>{
this.loading = false
this.getProjects()
})

},

getProjects(){

return this.projectsList =
(this.currentFilter === 'all'
? this.projects.slice(0,this.projectsCount)
: this.projects.filter(el => el.category.includes(this.currentFilter)))

},

loadMore(){

if(this.projectsList.length <= this.projects.length){

this.projectsCount += this.perPage
this.getProjects()

}

},

setFilter(filter){

if(filter === 'all'){
this.currentFilter = 'all'
}
else if(this.currentFilter === filter){
this.currentFilter = 'all'
}
else{
this.currentFilter = filter
}

this.getProjects()

},

getTechColor(name){

let hash = 0

for(let i=0;i<name.length;i++){
hash = name.charCodeAt(i) + ((hash<<5)-hash)
}

const hue = hash % 360

return `hsl(${hue},55%,55%)`

}

},

mounted(){

setTimeout(this.fetchData,1000)

if(location.hash){
location.replace(location.hash.replace('#',''))
}

},

computed:{

technologiesStats(){

const counts = {}

this.projects.forEach(project=>{
project.category.forEach(cat=>{
counts[cat] = (counts[cat] || 0) + 1
})
})

const total = Object.values(counts).reduce((a,b)=>a+b,0)

return Object.keys(counts)
.map(cat=>({
name:cat,
count:counts[cat],
percent:(counts[cat]/total*100)
}))
.sort((a,b)=>b.percent-a.percent)

},

maxProjectsCount(){

return this.projects
? (this.currentFilter !== "all"
? this.projects.filter(el => el.category.includes(this.currentFilter)).length
: this.projects.length)
: this.projectsCount

}

}

}



// router

const routes = [

{path:'/',component:Projects},

{
path:'/projects/:id',
component:ProjectDetails,
name:'ProjectDetails',
params:true
}

]

const router = new VueRouter({
mode:'history',
routes
})

router.beforeEach((to,from,next)=>{

if(to.fullPath.substr(0,2)==="/#"){

const path = to.fullPath.substr(2)
next(path)
return

}

next()

})



// Vue app

const app = new Vue({
router
}).$mount('#app')
