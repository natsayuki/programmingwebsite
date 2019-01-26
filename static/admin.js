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

let data = {
  newUserName: "",
  newUserCode: "",
  users: [],
  newClassName: "",
  classes: [],
  file: null,
}

let methods = {
  random(min, max){
    return Math.floor(Math.random() * max + min);
  },
  addNewUser(username, tempClass){
    let tempCode = methods.random(10000, 99999).toString();
    db.collection('users').add({
      name: username,
      code: tempCode,
    });
    db.collection('classes').where('name', '==', tempClass).get().then(snapshot => {
      let tempUsers = snapshot.docs[0].data().users;
      tempUsers.push(tempCode);
      db.collection('classes').doc(snapshot.docs[0].id).update({
        users: tempUsers,
      });
    });
  },
  getUsers(){
    data.users = [];
    db.collection('users').get().then(snapshot => {
      snapshot.docs.forEach(doc => {
        data.users.push(doc.data());
      });
    });
    return data.users;
  },
  createClass(e){
    e.preventDefault();
    db.collection('classes').add({
      name: data.newClassName,
      users: [],
    });
  },
  getClasses(){
    data.classes = [];
    db.collection('classes').get().then(snapshot => {
      snapshot.docs.forEach(doc => {
        temp = doc.data();
        temp.id = doc.id
        data.classes.push(temp);
      });
    });
  },
  handleFile(e){
    data.file = e.target.files[0];
  },
  uploadTest(e){
    e.preventDefault();
    methods.readFile(data.file , function(content){
      $.post('/newtest', {
        name: data.file.name,
        content: content,
      });
      db.collection('tests').add({
        name: data.file.name,
      });
    });
  },
  readFile(file, tempCallback){
    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = e => {
      tempCallback(e.target.result);
    }
  },
}

Vue.component('classtag', {
  props: ['tempclass'],
  data: function(){
    return {
      newUserName: "",
      users: []
    }
  },
  methods: {
    getUsers: function(){
      this.users = [];
      this.tempclass.users.forEach(user => {
        db.collection('users').where('code', '==', user).get().then(snapshot => {
          this.users.push(snapshot.docs[0].data());
        });
      });
    },
    addNewUser: function(e){
      e.preventDefault();
      methods.addNewUser(this.newUserName, this.tempclass.name);
    },
  },
  created: function(){
    this.getUsers();
  },
  template: `
  <div class="column">
    <h3>{{tempclass.name}}</h3>
    <form @submit="addNewUser">
      <h4>add new user to {{tempclass.name}}</h4>
      <input v-model="newUserName" />
      <button action="submit">submit</button>
    </form>
    <div v-for="user in users" class="row">
      {{user.name}} {{user.code}}
    </div>
  </div>
  `
});

const vm = new Vue({
  el: "#app",
  data: data,
  methods: methods
});

methods.getClasses();
