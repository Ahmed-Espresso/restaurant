const categories = ['1', '2', '3', '4'];
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const randomMealBtn = document.getElementById('random-meal-btn');
const randomMealContainer = document.getElementById('random-meal-container');
let cart = [];
let displayedProducts = {}; // المنتجات المعروضة حاليًا حسب كل قسم

// تحميل الأقسام
categories.forEach(category => {
    loadCategory(category);
});

// تحميل المنتجات من ملفات JSON
function loadCategory(category) {
    fetch(`menu${category}.json`)
        .then(response => response.json())
        .then(data => {
            displayedProducts[category] = data.products; // حفظ المنتجات حسب القسم
            displayProducts(category, data.products);
        });
}


// عرض المنتجات في القسم مع التصميم الجديد
function displayProducts(category, products) {
    const categorySection = document.getElementById(`category-${category}`);
    categorySection.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('item'); // تغيير الكلاس إلى item
        productCard.innerHTML = `
            <div class="product-container">
                <div class="icon" onclick="toggleDescription(this)">i</div>
                <div class="contents">
                    <h3>مكونات الوجبه</h3>
                    <p>${product.description}</p>
                </div>
            </div>
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image">
            </div>
            <div class="product-info">
                <div class="product-name-price">
                    <p class="product-name">${product.name}</p>
                    <p class="product-price">${product.price} جنيه</p>
                </div>
                <button class="product-button" onclick='addToCart(${JSON.stringify({ ...product, category })})'>🛒</button>
            </div>
        `;
        categorySection.appendChild(productCard);
    });
}




// البحث عن المنتجات في القسم الحالي
categories.forEach(category => {
    const searchInput = document.getElementById(`search-${category}`);
    const searchBtn = document.getElementById(`search-btn-${category}`);
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        const filteredProducts = displayedProducts[category].filter(product =>
            product.name.includes(query) || product.description.includes(query)
        );
        displayProducts(category, filteredProducts);
    });
});




// إضافة منتج إلى السلة
function addToCart(product) {
    const existingProduct = cart.find(item => item.id === product.id && item.category === product.category);
    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCart();
    showMessage(" تم إضافة الوجبه ", "confirmation-message");
}

// تحديث السلة
function updateCart() {
    cartItems.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity; // حساب المجموع لهذا المنتج
        total += itemTotal;

        const cartItem = document.createElement('li');
        cartItem.className = "cart-item";
        cartItem.innerHTML = `
           <div class="item-details">
                ${item.name} - ${item.quantity} × ${item.price} جنيه = <strong>${itemTotal} جنيه</strong>
           </div>

            <div class="item-controls" >
            <button onclick="increaseQuantity(${item.id}, '${item.category}')">+</button>
            <button onclick="decreaseQuantity(${item.id}, '${item.category}')">-</button>
            <button onclick="removeFromCart(${item.id}, '${item.category}')">🗑️</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });

    // عرض الإجمالي الكلي
    cartTotal.textContent = `الإجمالي: ${total} جنيه`;
}

// زيادة الكمية
function increaseQuantity(id, category) {
    const item = cart.find(item => item.id === id && item.category === category);
    if (item) {
        item.quantity++;
        updateCart();
    }
}

// تقليل الكمية
function decreaseQuantity(id, category) {
    const item = cart.find(item => item.id === id && item.category === category);
    if (item) {
        if (item.quantity > 1) {
            item.quantity--;
        } else {
            removeFromCart(id, category);
        }
        updateCart();
    }
}

// حذف المنتج من السلة
function removeFromCart(id, category) {
    cart = cart.filter(item => !(item.id === id && item.category === category));
    updateCart();
}

// عرض نموذج تأكيد السلة
function showConfirmationForm() {
    document.getElementById('confirmation-section').style.display = 'block';
}

// إرسال التأكيد عبر واتساب
function sendConfirmation() {
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const message = document.getElementById('customer-message').value.trim();

    if (!name || !phone) {
        showMessage("يجب إدخال الاسم ورقم الهاتف", "error-message");
        return;
    }

    // عنوان الطلب
    let whatsappMessage = " *🧾أوردر جديد* \n";
    whatsappMessage += "=====================\n";
    whatsappMessage += `👤 *اسم العميل:* ${name}\n`;
    whatsappMessage += `📱 *رقم الهاتف:* ${phone}\n`;
    whatsappMessage += `📜 الرسالة: ${message || "لا توجد رسالة"}\n`;
    whatsappMessage += "🛒 *محتويات السلة:* \n";
    whatsappMessage += "=====================\n";
    

    // محتويات السلة بتنسيق منظم
    cart.forEach(item => {
        whatsappMessage += `🍕 *${item.name}*\n`;
        whatsappMessage += `    ✨ *الكمية:* ${item.quantity}\n`;
        whatsappMessage += `    ✨ *السعر:* ${item.price} جنيه\n`;
        whatsappMessage += `    ✨ *الإجمالي:* ${item.price * item.quantity} جنيه\n`;
        whatsappMessage += "---------------------\n";
    });

    // حساب الإجمالي
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    whatsappMessage += `💰 *الإجمالي الكلي:* ${totalAmount} جنيه\n`;
    whatsappMessage += "=====================\n";

    // فتح واتساب بالرابط
    const whatsappURL = `https://wa.me/201030851648?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappURL, "_blank");
}
// وجبة عشوائية
const randomMealCountInput = document.getElementById("random-meal-count");

randomMealBtn.addEventListener("click", () => {
    const count = parseInt(randomMealCountInput.value, 10) || 1;
    const allProducts = [];

    // تحميل كل المنتجات من جميع الأقسام
    const fetchPromises = categories.map(category =>
        fetch(`menu${category}.json`)
            .then(response => response.json())
            .then(data => allProducts.push(...data.products))
    );

    Promise.all(fetchPromises).then(() => {
        displayRandomMeals(getRandomMeals(allProducts, count));
    });
});

// اختيار عدد محدد من المنتجات العشوائية
function getRandomMeals(products, count) {
    const shuffled = products.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// عرض الوجبات العشوائية المحددة
function displayRandomMeals(meals) {
    randomMealContainer.innerHTML = meals.map(meal => `
        <div class="item">
            <div class="product-container">
                <div class="icon" onclick="toggleDescription(this)">i</div>
                <div class="contents">
                    <h3>مواصفات المنتج</h3>
                    <p>${meal.description}</p>
                </div>
            </div>
            <div class="product-image-container">
                <img src="${meal.image}" alt="${meal.name}" class="product-image">
            </div>
            <div class="product-info">
                <div class="product-name-price">
                    <p class="product-name">${meal.name}</p>
                    <p class="product-price">${meal.price} جنيه</p>
                </div>
                <button class="product-button" onclick='addToCart(${JSON.stringify(meal)})'>🛒</button>
            </div>
        </div>
    `).join('');
}

// تحديد فئة المنتج بناءً على ID
function findCategory(id, allProducts) {
    for (const category of categories) {
        if (displayedProducts[category]?.some(product => product.id === id)) {
            return category;
        }
    }
    return null;
}

// عرض رسالة
function showMessage(msg, elementId) {
    const messageDiv = document.getElementById(elementId);
    messageDiv.textContent = msg;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}


document.addEventListener("DOMContentLoaded", () => {
    fetch("recipes.json")
        .then(response => response.json())
        .then(data => {
            displayRecipeButtons(data.recipes);
        });

    // تفعيل البحث عند الضغط على زر البحث فقط
    document.getElementById("recipe-search-btn").addEventListener("click", () => {
        searchRecipes();
    });
});

// عرض أزرار الوصفات
function displayRecipeButtons(recipes) {
    const buttonsContainer = document.getElementById("recipe-buttons");
    buttonsContainer.innerHTML = "";
    recipes.forEach(recipe => {
        const button = document.createElement("button");
        button.classList.add("recipe-button");
        button.textContent = recipe.name;
        button.addEventListener("click", () => displayRecipeDetails(recipe));
        buttonsContainer.appendChild(button);
    });
}

// عرض تفاصيل الوصفة
function displayRecipeDetails(recipe) {
    const detailsContainer = document.getElementById("recipe-details");
    detailsContainer.innerHTML = `
        <h3>${recipe.name}</h3>
        <p>${recipe.description}</p>
    
    `;
    detailsContainer.style.display = "block";
}

// البحث عن الوصفات فقط عند الضغط على زر البحث
function searchRecipes() {
    const query = document.getElementById("recipe-search").value.trim();
    if (!query) return; // منع البحث إذا كان الحقل فارغًا

    fetch("recipes.json")
        .then(response => response.json())
        .then(data => {
            const filteredRecipes = data.recipes.filter(recipe => 
                recipe.name.includes(query) || recipe.description.includes(query)
            );
            displayRecipeButtons(filteredRecipes);
        });
}











document.addEventListener("DOMContentLoaded", function() {
    const navbarLinks = document.querySelectorAll("#navbar a");
    const navbarHeight = document.getElementById("navbar").offsetHeight; // ارتفاع النافبار

    navbarLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault(); // منع الانتقال الافتراضي
            const targetId = this.getAttribute("href").substring(1); // إزالة #
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                const sectionPosition = targetSection.offsetTop - navbarHeight; // طرح ارتفاع النافبار

                window.scrollTo({
                    top: sectionPosition,
                    behavior: "smooth"
                });
            }
        });
    });
});