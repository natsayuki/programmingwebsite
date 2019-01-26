var config = {
  apiKey: "AIzaSyCWA3t0tLxw6rz8DA4BAWUXalKNalNq7q0",
  authDomain: "classwebsite.firebaseapp.com",
  databaseURL: "https://classwebsite.firebaseio.com",
  projectId: "classwebsite",
  storageBucket: "",
  messagingSenderId: "794683999233"
};
firebase.initializeApp(config);

const db = firebase.firestore();
db.settings({timestampsInSnapshots: true});

Vue.use(VueMaterial.default);

Vue.config.productionTip = false;

const fileArea = document.getElementById('fileArea');

let data = {
  userCode: "",
  userLoggedIn: false,
  userName: null,
  userProjects: [],
  projectContent: "",
  projectTitle: "",
  showSnack: false,
  snackMessage: "",
  copyValue: "",
  hasFile: false,
  fileName: "",
  file: null,
  dragenter: false,
  tests: [],
}

let methods = {
  loginUserWithCode(e){
    e.preventDefault();
    db.collection('users').where('code', '==', data.userCode).get().then(snapshot => {
      snapshot.docs.forEach(doc => {
        data.userLoggedIn = true;
        data.userName = doc.data().name;
      });
      methods.getUserProjects();
    });
  },
  getUserProjects(){
    data.userProjects = [];
    db.collection('projects').where('user', '==', data.userName).get().then(snapshot => {
      console.log(snapshot.docs);
      snapshot.docs.forEach(doc => {
        tempDoc = doc.data();
        tempDoc.id = doc.id
        data.userProjects.push(tempDoc);
      });
    });
  },
  submitNewPost(e){
    e.preventDefault();
    db.collection('projects').add({
      user: data.userName,
      title: data.projectTitle,
      content: [data.projectContent],
      correct: null,
    });
    methods.snackbar("new project submitted");
  },
  snackbar(message){
    data.snackMessage = message;
    data.showSnack = true;
  },
  copy(text){
    data.copyValue = text;
    document.getElementById("copyIn").select();
    document.execCommand("copy");
    document.execCommand("copy");
    document.getElementById("copyIn").blur();
  },
  createProjectFromFile(){
    db.collection('projects').add({
      user: data.userName,
      title: data.file.name,
      content: [data.file.body],
      correct: null,
    });
    methods.snackbar("new file uploaded");
  },
  handleFile(){
    data.hasFile = true;
    data.fileName = data.file.name;
    methods.readFile(data.file, body => {
      data.file.body = body
    });
  },
  handleDrop(e){
    e.preventDefault();
    e.stopPropagation();
    data.file = e.dataTransfer.files[0];
    data.dragenter = false;
    methods.handleFile();
  },
  handleUpload(e){
    data.file = e.target.files[0];
    methods.handleFile();
  },
  handleDragover(e){
    e.preventDefault();
    data.dragenter = true;
  },
  readFile(file, tempCallback){
    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = e => {
      tempCallback(e.target.result);
    }
  },
  updateProject(file, project){
    console.log(file, project);
    methods.readFile(file, content => {
      project.content.push(content);
      db.collection('projects').doc(project.id).update({
        title: file.name,
        content: project.content,
        correct: null,
      });
      methods.snackbar(`updated ${project.title}`);
    });
  },
  getTests(){
    data.tests = [];
    db.collection('tests').get().then(snapshot => {
      snapshot.docs.forEach(doc => {
        data.tests.push(doc.data().name);
      });
    });
  },

}

Vue.component('project', {
  props: ['project', 'name', 'tests'],
  data: function(){
    return {
      expand: false,
      dragenter: false,
      content: this.project.content[this.project.content.length -1],
    }
  },
  methods: {
    copy: methods.copy,
    snackbar: methods.snackbar,
    handleDrop: function(e){
        if(this.name != this.project.user){
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        this.dragenter = false;
        methods.updateProject(e.dataTransfer.files[0], this.project);
    },
    handleDragover:   function(e){
      e.preventDefault();
      this.dragenter = true;
    },
    evaluate: function(e){
      const project = this.project;
      const snackbar = this.snackbar;
      e.preventDefault();
      $.post('/evaltest', {
        name: this.project.title,
        code: this.content,
      }, function(passed){
        passed = passed.trim();
        if(passed == "True") snackbar(`Nice! ${project.title} evaluated correctly!`);
        else snackbar(`Uh-oh! It looks like there's some work to be done on ${project.title}`);
        db.collection('projects').doc(project.id).update({
          correct: passed
        });
      });
    }
  },
  template: `
  <span class="projectWrapper"
  :class="dragenter && project.user == name ? 'fileAreaHover' : project.user == name ? 'fileArea' : ''"
  @dragover="handleDragover" @dragleave="dragenter = false" @drop="handleDrop">
    <md-card md-with-hover class="project" :id="project.id">
      <md-card-header>
        <div class="md-title">{{project.title}}</div>
        <div class="md-subhead">by {{project.user}}</div>
      </md-card-header>
      <md-card-expand>
        <md-card-actions class="noBackground">
          <i class="far fa-times-circle cross" v-if="project.correct == 'False'"></i>
          <i class="far fa-check-circle check" v-if="project.correct == 'True'"></i>
          <md-button class="md-accent" v-if="tests.indexOf(project.title) != -1" @click="evaluate">evaluate</md-button>
          <md-button @click="copy(content)">copy</md-button>
          <md-card-expand-trigger>
            <md-button @click="expand = !expand">{{expand ? "close" : "expand"}}</md-button>
          </md-card-expand-trigger>
        </md-card-actions>
        <md-card-expand-content>
          <md-card-content>
            <span v-if="project.content.length > 1" class="md-subhead">
              version {{project.content.length}}
            </span>
            <pre>{{content}}</pre>
          </md-card-content>
        </md-card-expand-content>
      </md-card-expand>
    </md-card>
  </span>
  `
});

const vm = new Vue({
  el: "#app",
  data: data,
  methods: methods
});

methods.getTests();

db.collection('projects').onSnapshot(snapshot => {
  methods.getUserProjects();
});
