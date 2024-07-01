import { initializeApp } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/9.5.0/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, getDocs, getDoc,doc,setDoc } 
from "https://www.gstatic.com/firebasejs/9.5.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAfJkEGmulZw6VDoRpCQQYjBnFVD44i7eg",
  authDomain: "app--project-dd7e8.firebaseapp.com",
  projectId: "app--project-dd7e8",
  storageBucket: "app--project-dd7e8.appspot.com",
  messagingSenderId: "969034369566",
  appId: "1:969034369566:web:bc29b860600b689826fc0f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


const signUpForm = document.getElementById('signUpForm');
const signInForm = document.getElementById('signInForm');
const signOutLink = document.getElementById('signOutLink');
const addProductForm = document.getElementById('addProductForm');
const productList = document.getElementById('productList');
const profileEmail = document.getElementById('profileEmail');
const viewProductModal = document.getElementById('viewProductModal');

// Sign up
signUpForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = signUpForm['signUpEmail'].value;
  const password = signUpForm['signUpPassword'].value;
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log('User signed up:', userCredential.user);
      signUpForm.reset();
      displayProducts();
    })
    .catch((error) => {
      console.error('Error signing up:', error);
      alert(error.message)
    });
});
document.addEventListener(
  "DOMContentLoaded", ()=>{
    if(
      !auth.currentUser
    ){
      signInForm.style.display="block"
    }
  }
)
// Sign in
signInForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = signInForm['signInEmail'].value;
  const password = signInForm['signInPassword'].value;
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log('User signed in:', userCredential.user);
      signInForm.reset();
      displayProducts();
    })
    .catch((error) => {
      console.error('Error signing in:', error);
      alert(error.message)
    });
});

// Sign out
signOutLink.addEventListener('click', () => {
  signOut(auth)
    .then(() => {
      console.log('User signed out');
      showSection('auth_signin');
    })
    .catch((error) => {
      console.error('Error signing out:', error);
    });
});

// Add product
addProductForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = addProductForm['productName'].value;
  const price = parseFloat(addProductForm['productPrice'].value);
  const description = addProductForm['productDescription'].value;
  const imageUrl = addProductForm['productImage'].value;
  addDoc(collection(db, 'products'), {
    name: name,
    price: price,
    description: description,
    imageUrl: imageUrl
  })
    .then((docRef) => {
      console.log('Product added with ID:', docRef.id);
      addProductForm.reset();
      displayProducts() 
    })
    .catch((error) => {
      console.error('Error adding product:', error);
    });
});

// Delete product
function deleteProduct(productId) {
  deleteDoc(doc(db, 'products', productId))
    .then(() => {
      console.log('Product deleted with ID:', productId);
      displayProducts();
    })
    .catch((error) => {
      console.error('Error deleting product:', error);
    });
}

function viewProduct(product){
  viewProductModal.innerHTML = `
   <h3>${product.name}</h3>
          <p>Price: $${product.price}</p>
          <p>${product.description}</p>
          <img src="${product.imageUrl}" alt="${product.name}">`;
  viewProductModal.style.display = "block"
}

let deleteButtons = []
// Display products
function displayProducts() {
  productList.innerHTML = '';
  deleteButtons = []
  getDocs(collection(db, 'products'))
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const product = doc.data();
        const li = document.createElement('li');
        li.innerHTML = `
          <h3>${product.name}</h3>
          <p>Price: $${product.price}</p>
          <p>${product.description}</p>
          <img src="${product.imageUrl}" alt="${product.name}">
          <button class="del" id="del-btn-${doc.id}">Delete</button>
          <button class="view" id="view-btn-${doc.id}">View</button>
        `;
        productList.appendChild(li);
        const btnDelete = document.getElementById(`del-btn-${doc.id}`)
        btnDelete.addEventListener('click', () => {
          deleteProduct(doc.id)
        }) 
        const btnView = document.getElementById(`view-btn-${doc.id}`)
        btnView.addEventListener('click', () => {
          viewProduct(product)
        }) 

        if(!logged_user || !logged_user.isAdmin) {
          btnDelete.style.display = 'none'
        }
        deleteButtons.push(btnDelete)
      });
    })
    .catch((error) => {
      console.error('Error displaying products:', error);
    });
}


function displayProfile() {
  const user = auth.currentUser;
  if (user) {
    profileEmail.textContent = user.email;
  } else {
    profileEmail.textContent = '';
  }
}

let logged_user;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log('User signed in:', user);
    const userDoc = await getDoc(doc(db, "users", user.uid))
    if (userDoc.exists()) {
      logged_user = userDoc.data();
    } else {
      logged_user =  {email: user.email, id: user.uid, isAdmin: false}
      await setDoc(doc(db, "users", user.uid), logged_user)
    }

    if(logged_user.isAdmin) {
      adminLink.style.display = 'inherit'
      for(var button of deleteButtons) {
        button.style.display = 'inherit'
      }
    }else {
      adminLink.style.display = 'none'
      for(var button of deleteButtons) {
        button.style.display = 'none'
      }
    }
    signOutLink.style.display = 'inherit'
    displayProfile();
    showSection('home');
  } else {
    signOutLink.style.display = 'none'
    console.log('User signed out');
    displayProfile();
    showSection('auth_signin');
  }
});


const toRegister = document.getElementById('toRegister')
const toLogin = document.getElementById('toLogin')

const productsLink = document.getElementById('productsLink');
const adminLink = document.getElementById('adminLink');

adminLink.style.display = 'none' 

const profileLink = document.getElementById('profileLink');

function showSection(sectionId) {
  const sections = document.querySelectorAll('section');
  sections.forEach((section) => {
    if (section.id === sectionId) {
      section.style.display = 'block';
    } else {
      section.style.display = 'none';
    }
  });
}

toRegister.addEventListener('click', (e) => {
  e.preventDefault();
  showSection('auth_signup');
})
toLogin.addEventListener('click', (e) => {
  e.preventDefault();
  showSection('auth_signin');
})

productsLink.addEventListener('click', (e) => {
  e.preventDefault();
  showSection('products');
});

adminLink.addEventListener('click', (e) => {
  e.preventDefault();
  showSection('admin');
});

profileLink.addEventListener('click', (e) => {
  e.preventDefault();
  showSection('profile');
});

viewProductModal.addEventListener('click', (e) => {
  viewProductModal.style.display = "none"
})

displayProducts();
showSection('auth_signin');