class Note {
   constructor(id, title, text) {
      this.title = title;
      this.text = text;
      this.id = id;
   }
}
class App {
   constructor() {
      // localStorage.setItem('test', JSON.stringify(['124']));
      // console.log(JSON.parse(localStorage.getItem('test')));
      this.notes = JSON.parse(localStorage.getItem("notes")) || [];
      console.log(this.notes);
      this.selectedNoteId = "";
      this.miniSidebar = true;

      this.$activeForm = document.querySelector(".active-form");
      this.$inactiveForm = document.querySelector(".inactive-form");
      this.$noteTitle = document.querySelector("#note-title");
      this.$noteText = document.querySelector("#note-text");
      this.$notes = document.querySelector(".notes");
      this.$form = document.querySelector("#form");
      this.$modal = document.querySelector(".modal");
      this.$modalForm = document.querySelector("#modal-form");
      this.$modalTitle = document.querySelector("#modal-title");
      this.$modalText = document.querySelector("#modal-text");
      this.$closeModalForm = document.querySelector("#modal-btn");
      this.$sidebar = document.querySelector(".sidebar");
      this.$sidebarActiveItem = document.querySelector(".active-item");

      this.$app = document.querySelector("#app");
      this.$firebaseAuthContainer = document.querySelector("#firebaseui-auth-container");
      this.$authUserText = document.querySelector(".auth-user");
      this.$logoutButton = document.querySelector(".logout");



      //Initialize the firebaseUI instance
      this.ui = new firebaseui.auth.AuthUI(auth);
      this.handleAuth();

      this.addEventListeners();
      this.displayNotes();
   }

   handleAuth() {
      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            this.$authUserText.innerHTML = user.displayName;
            this.redirectToApp();
         } else {
            this.redirectToAuth();
         }
      });

   }

   handleLogout() {
      firebase.auth().signOut().then(() => {
         this.redirectToAuth();
      }).catch((error) => {
         console.log("ERROR OCCURED", error);
      });
   }

   redirectToApp() {
      this.$firebaseAuthContainer.style.display = "none";
      this.$app.style.display = "block";
   }

   redirectToAuth() {
      this.$firebaseAuthContainer.style.display = "block";
      this.$app.style.display = "none";

      this.ui.start('#firebaseui-auth-container', {
         signInOptions: [
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
         ],
      });
   }
   
   addEventListeners() {
      document.body.addEventListener("click", (event) => {
         this.handleFormClick(event);
         this.closeModal(event);
         this.openModal(event);
         this.handleArchiving(event);
      });

      this.$form.addEventListener("submit", (event) => {
         event.preventDefault();
         const title = this.$noteTitle.value;
         const text = this.$noteText.value;
         this.addNote({
            title,
            text
         });
         this.closeActiveForm();
      });

      this.$modalForm.addEventListener("submit", (event) => {
         event.preventDefault();
      });

      this.$sidebar.addEventListener("mouseover", (event) => {
         this.handleToggleSidebar();
      });

      this.$sidebar.addEventListener("mouseout", (event) => {
         this.handleToggleSidebar();
      });

      this.$logoutButton.addEventListener("click", (event) => {
         this.handleLogout();
      });
   }

   handleFormClick(event) {
      const isActiveFormClickedOn = this.$activeForm.contains(event.target);
      const isInActiveFormClickedOn = this.$inactiveForm.contains(event.target);
      const title = this.$noteTitle.value;
      const text = this.$noteText.value;

      if (isInActiveFormClickedOn) {
         this.openActiveForm();
      } else if (!isInActiveFormClickedOn && !isActiveFormClickedOn) {
         this.addNote({
            title,
            text
         });
         this.closeActiveForm();
      }
   }

   openActiveForm() {
      this.$inactiveForm.style.display = "none";
      this.$activeForm.style.display = "block";
      this.$noteText.focus();
   }

   closeActiveForm() {
      this.$inactiveForm.style.display = "block";
      this.$activeForm.style.display = "none";
      this.$noteText.value = "";
      this.$noteTitle.value = "";
   }

   openModal(event) {
      const $selectedNote = event.target.closest(".note");
      if ($selectedNote && !event.target.closest(".archive")) {
         this.selectedNoteId = $selectedNote.id;
         this.$modalTitle.value = $selectedNote.children[1].innerHTML;
         this.$modalText.value = $selectedNote.children[2].innerHTML;
         this.$modal.classList.add("open-modal");
      } else {
         return;
      }
   }

   closeModal(event) {
      const isModalFormClickedOn = this.$modalForm.contains(event.target);
      const isCloseModalBtnClickedOn = this.$closeModalForm.contains(event.target);
      if ((!isModalFormClickedOn || isCloseModalBtnClickedOn) && this.$modal.classList.contains("open-modal")) {
         this.editNote(this.selectedNoteId, {
            title: this.$modalTitle.value,
            text: this.$modalText.value,
         });
         this.$modal.classList.remove("open-modal");
      }
   }

   handleArchiving(event) {
      const $selectedNote = event.target.closest(".note");
      if ($selectedNote && event.target.closest(".archive")) {
         this.selectedNoteId = $selectedNote.id;
         this.deleteNote(this.selectedNoteId);
      } else {
         return;
      }
   }

   addNote({
      title,
      text
   }) {
      if (text != "") {
         const newNote = new Note(cuid(), title, text);
         this.notes = [...this.notes, newNote];
         this.render();
      }
   }

   editNote(id, {
      title,
      text
   }) {
      this.notes = this.notes.map((note) => {
         if (note.id == id) {
            note.title = title;
            note.text = text;
         }
         return note;
      });
      this.render();
   }

   deleteNote(id) {
      this.notes = this.notes.filter(note => note.id != id);
      this.render();
   }

   handleMouseOverNote(element) {
      const $note = document.querySelector("#" + element.id);
      const $checkNote = $note.querySelector(".check-circle");
      const $noteFooter = $note.querySelector(".note-footer");
      $checkNote.style.visibility = "visible";
      $noteFooter.style.visibility = "visible";
   }

   handleMouseOutNote(element) {
      const $note = document.querySelector("#" + element.id);
      const $checkNote = $note.querySelector(".check-circle");
      const $noteFooter = $note.querySelector(".note-footer");
      $checkNote.style.visibility = "hidden";
      $noteFooter.style.visibility = "hidden";
   }

   handleToggleSidebar() {
      if (this.miniSidebar) {
         this.$sidebar.style.width = "250px";
         this.$sidebar.classList.add("sidebar-hover");
         this.$sidebarActiveItem.classList.add("sidebar-active-item");
         this.miniSidebar = false;
      } else {
         this.$sidebar.style.width = "65px";
         this.$sidebar.classList.remove("sidebar-hover");
         this.$sidebarActiveItem.classList.remove("sidebar-active-item");
         this.miniSidebar = true;
      }
   }

   saveNotes() {
      localStorage.setItem('notes', JSON.stringify(this.notes));
   }

   render() {
      this.saveNotes();
      this.displayNotes();
   }

   displayNotes() {
      this.$notes.innerHTML = this.notes.map((note) =>
         `
         <div class="note" id="${note.id}" onmouseover="app.handleMouseOverNote(this)" onmouseout="app.handleMouseOutNote(this)">
         	<span class="material-symbols-outlined check-circle">check_circle</span>
          		<div class="title">${note.title}</div>
          		<div class="text">${note.text}</div>
          	<div class="note-footer">
            	<div class="tooltip">
              		<span class="material-symbols-outlined hover small-icon"0>add_alert</span>
              		<span class="tooltip-text">Remind me</span>
            	</div>
            	<div class="tooltip">
              		<span class="material-symbols-outlined hover small-icon">person_add</span>
              		<span class="tooltip-text">Collaborator</span>
            	</div>
            	<div class="tooltip">
              		<span class="material-symbols-outlined hover small-icon">palette</span>
              		<span class="tooltip-text">Change Color</span>
            	</div>
            	<div class="tooltip">
              		<span class="material-symbols-outlined hover small-icon">image</span>
              		<span class="tooltip-text">Add Image</span>
            	</div>
            	<div class="tooltip archive">
              		<span class="material-symbols-outlined hover small-icon">archive</span>
              		<span class="tooltip-text">Archive</span>
            	</div>
            	<div class="tooltip">
              		<span class="material-symbols-outlined hover small-icon">more_vert</span>
              		<span class="tooltip-text">More</span>
            	</div>
          	</div>
			</div>
         `
      ).join("");
   }
}

const app = new App();