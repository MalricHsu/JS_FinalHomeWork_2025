//取得顧客網址
const url = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}`;

//抓取DOM
const productWrap = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const orderInfoBtn = document.querySelector(".orderInfo-btn");
const orderInfoForm = document.querySelector(".orderInfo-form");
const discardAllBtn = document.querySelector(".discardAllBtn");

//抓取父層元素
const shoppingCartTableBody = document.querySelector(
  ".shoppingCart-table tbody"
);
const shoppingCartTableFoot = document.querySelector(
  ".shoppingCart-table tfoot"
);

//第一部分商品區：取得商品資料、渲染商品資料、篩選商品

//取得商品資料
let productData = [];
function getProductData() {
  axios
    .get(`${url}/products`)
    .then((res) => {
      // console.log(res.data.products);
      productData = res.data.products;
      productRender(productData);
    })
    .catch((err) => {
      console.log(err.message);
    });
}
//渲染商品資料
function productRender(data) {
  let template = "";
  data.forEach((product) => {
    template += ` <li class="productCard">
          <h4 class="productType fs-18">新品</h4>
          <img
            src="${product.images}"
            alt="${product.title}"
          />
          <a href="#" class="addCardBtn" data-id=${product.id}>加入購物車</a>
          <h3 class="fs-18">${product.title}</h3>
          <del class="originPrice">NT$${formatNumber(
            product.origin_price
          )}</del>
          <p class="nowPrice">NT$${formatNumber(product.price)}</p>
        </li>`;
  });
  productWrap.innerHTML = template;
}
//篩選商品
function filterProduct() {
  const filterResult = [];
  productData.forEach((product) => {
    if (product.category === productSelect.value) {
      filterResult.push(product);
    }
    if (productSelect.value === "全部") {
      filterResult.push(product);
    }
  });
  productRender(filterResult);
}
//監聽事件-篩選商品
productSelect.addEventListener("change", filterProduct);

//第二部分購物車區：取得購物車資料、渲染購物車資料、加入購物車、一般監聽事件：點擊加入購物車、
//父層監聽事件：刪除單一購物車商品、編輯購物車商品數量、刪除所有商品

//取得購物車資料
let cartData = [];
let cartTotal = 0;
function getCartData() {
  axios
    .get(`${url}/carts`)
    .then((res) => {
      // console.log(res.data.carts);
      cartData = res.data.carts;
      cartTotal = res.data.finalTotal;
      cartRender(cartData);
    })
    .catch((err) => {
      console.log(err.message);
    });
}

//渲染購物車畫面
function cartRender(data) {
  if (cartData.length === 0) {
    shoppingCartTableBody.innerHTML = `
<tr>
  <td colspan="5">
    <div style="display:flex; justify-content:center; align-items:center; min-height:100px;">
      <h2>購物車目前沒有商品</h2>
    </div>
  </td>
</tr>
`;
    shoppingCartTableFoot.innerHTML = `<tr>
              <td>
                <a href="#" class="discardAllBtn">刪除所有品項</a>
              </td>
              <td></td>
              <td></td>
              <td>
                <p>總金額</p>
              </td>
              <td>NT$${formatNumber(cartTotal)}</td>
            </tr>`;
    return;
  }
  let template = "";
  data.forEach((item) => {
    template += `
<tr>
  <td>
    <div class="cardItem-title">
      <img src="${item.product.images}" alt="${item.product.title}" />
      <p>${item.product.title}</p>
    </div>
  </td>

  <td style="text-align: center" >NT$${formatNumber(item.product.price)}</td>

  <td class="allBtn">
    <div class="btnWrap">
      <button type="button" class="minusBtn" data-id="${item.id}">
        <span class="material-symbols-outlined"> check_indeterminate_small </span>
      </button>
      <span class="quantity">${item.quantity}</span>
      <button type="button" class="plusBtn" data-id="${item.id}">
        <span class="material-symbols-outlined"> add </span>
      </button>
    </div>
  </td>
  <td style="text-align: center" >NT$${formatNumber(
    item.product.price * item.quantity
  )}</td>
  <td class="discardBtn">
    <a href="#" class="material-icons deleteItem" data-id="${item.id}">clear</a>
  </td>
</tr>
`;
  });
  shoppingCartTableBody.innerHTML = template;
  shoppingCartTableFoot.innerHTML = `<tr>
              <td>
                <a href="#" class="discardAllBtn">刪除所有品項</a>
              </td>
              <td></td>
              <td></td>
              <td>
                <p>總金額</p>
              </td>
              <td>NT$${formatNumber(cartTotal)}</td>
            </tr>`;
}
//加入購物車 -> 要看商品渲染資訊
function addCart(id) {
  //先看看原本購物車是否已經有該商品
  const existGood = cartData.find((item) => item.product.id === id);
  const quantity = existGood ? existGood.quantity + 1 : 1;

  const addCardBtn = document.querySelectorAll(".addCardBtn");
  addCardBtn.forEach((item) => {
    item.classList.add("disabled");
  });

  const addCartGood = {
    data: {
      productId: id,
      quantity: quantity,
    },
  };
  axios
    .post(`${url}/carts`, addCartGood)
    .then((res) => {
      // console.log(res.data.carts);
      cartData = res.data.carts;
      cartTotal = res.data.finalTotal;
      const addItem = cartData.find((e) => e.product.id === id);
      if (addItem) {
        Toast.fire({
          icon: "success",
          title: `${addItem.product.title}已經加入購物車`,
        });
      }
      addCardBtn.forEach((item) => {
        item.classList.remove("disabled");
      });
      cartRender(cartData);
    })
    .catch((err) => {
      console.log(err.message);
    });
}
//一般監聽事件：點擊加入購物車 -> 要看商品渲染資訊
productWrap.addEventListener("click", (e) => {
  e.preventDefault();
  // console.log(e.target.dataset.id);
  if (e.target.classList.contains("addCardBtn")) {
    const productId = e.target.dataset.id;
    addCart(productId);
  }
});

//父層監聽事件：刪除單一購物車商品、編輯購物車商品數量
shoppingCartTableBody.addEventListener("click", (e) => {
  e.preventDefault();
  const btn = e.target.closest("button, a"); //往上找父層
  if (!btn) return;
  const Id = btn.dataset.id;
  //刪除單一購物車商品
  if (btn.classList.contains("deleteItem")) {
    deleteCart(Id);
  }
  //編輯購物車商品數量（增加）
  if (btn.classList.contains("plusBtn")) {
    let result = {};
    cartData.forEach((item) => {
      if (item.id === Id) {
        result = item;
      }
    });
    let qty = result.quantity + 1;
    editCartNum(Id, qty);
  }
  //編輯購物車商品數量（減少）
  if (btn.classList.contains("minusBtn")) {
    let result = {};
    cartData.forEach((item) => {
      if (item.id === Id) {
        result = item;
      }
      let qty = result.quantity - 1;
      editCartNum(Id, qty);
    });
  }
});
//刪除單一購物車的商品
function deleteCart(id) {
  //先找到要刪除的商品
  const deleteItem = cartData.find((e) => e.id === id);
  Swal.fire({
    title: "刪除",
    text: `您確定要刪除${deleteItem.product.title}`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "確定",
    cancelButtonText: "取消",
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .delete(`${url}/carts/${id}`)
        .then((res) => {
          // console.log(res.data.carts);
          cartData = res.data.carts;
          cartRender(cartData);
        })
        .catch((err) => {
          console.log(err.message);
        });
      Swal.fire({
        title: "刪除成功",
        text: `您已刪除${deleteItem.product.title}`,
        icon: "success",
      });
    }
  });
}
//編輯產品數量
function editCartNum(id, qty) {
  const editData = {
    data: {
      id: id,
      quantity: qty,
    },
  };
  axios
    .patch(`${url}/carts`, editData)
    .then((res) => {
      cartData = res.data.carts;
      cartRender(cartData);
    })
    .catch((err) => {
      console.log(err.message);
    });
}

//父層監聽事件：刪除所有商品
shoppingCartTableFoot.addEventListener("click", (e) => {
  if (e.target.classList.contains("discardAllBtn")) {
    e.preventDefault();
    deleteAllCart();
  }
});
//刪除所有的購物車商品
function deleteAllCart() {
  if (cartData.length === 0) {
    Swal.fire({
      icon: "info",
      title: "購物車已經是空的",
    });
    return;
  }
  Swal.fire({
    title: "您確定要刪除全部的商品嗎？",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "確定",
    cancelButtonText: "取消",
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .delete(`${url}/carts`)
        .then((res) => {
          // console.log(res.data.carts)
          cartData = res.data.carts;
          cartRender(cartData);
          Swal.fire({
            title: "商品全部刪除成功",
            icon: "success",
          });
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  });
}

//第三部分表單區：一般監聽事件：點擊送出表單、送出表單、驗證表單

//一般監聽事件：點擊送出表單
orderInfoBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (cartData.length === 0) {
    Swal.fire({
      icon: "info",
      title: "購物車目前沒有商品",
    });
    return;
  }
  if (checkValue()) {
    Swal.fire({
      icon: "error",
      title: "您的資料尚未填寫完整",
    });
    return;
  }
  sendOrder();
  Swal.fire({
    icon: "success",
    title: "您的資料已送出",
  });
  orderInfoForm.reset();
});

//送出表單
function sendOrder() {
  const customerName = document.querySelector("#customerName").value.trim();
  const customerPhone = document.querySelector("#customerPhone").value.trim();
  const customerEmail = document.querySelector("#customerEmail").value.trim();
  const customerAddress = document
    .querySelector("#customerAddress")
    .value.trim();
  const tradeWay = document.querySelector("#tradeWay").value;
  const orderData = {
    data: {
      user: {
        name: customerName,
        tel: customerPhone,
        email: customerEmail,
        address: customerAddress,
        payment: tradeWay,
      },
    },
  };
  axios
    .post(`${url}/orders`, orderData)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
}

//驗證表單
function checkValue() {
  let constraints = {
    姓名: {
      presence: {
        message: "^必填欄位，請填寫姓名",
      },
    },
    電話: {
      presence: {
        message: "^必填欄位，請填寫電話",
      },
      format: {
        pattern: /^09\d{8}$/,
        message: "^請輸入正確的手機號碼格式 (例如 0912345678)",
      },
    },
    Email: {
      presence: {
        message: "^必填欄位，請填寫Email",
      },
      email: { message: "^請輸入正確的信箱格式" },
    },
    寄送地址: {
      presence: {
        message: "^必填欄位，請填寫寄送地址",
      },
    },
    交易方式: {
      presence: {
        message: "^必填欄位，請選擇支付方式",
      },
    },
  };
  const errors = validate(orderInfoForm, constraints);
  // console.log(errors);
  const message = document.querySelectorAll(`[data-message]`);
  message.forEach((msg) => {
    msg.textContent = "";
    if (errors) {
      Object.keys(errors).forEach((key) => {
        const errormessage = document.querySelector(`[data-message=${key}]`);
        if (errormessage) {
          errormessage.textContent = errors[key][0];
        }
      });
    }
  });
  return errors;
}

//第四部分：輔助功能
//千分比
function formatNumber(number) {
  let parts = number.toString().split("."); // 分割整數和小數部分
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); // 格式化整數部分
  return parts.length > 1 ? parts.join(".") : parts[0]; // 拼接小數部分
}

//初始化
function init() {
  getProductData();
  getCartData();
}
init();
