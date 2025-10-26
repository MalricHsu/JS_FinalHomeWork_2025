const url = `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}`;
const headers = {
  headers: {
    authorization: token,
  },
};

let orderData = {};
const orderPageTableBody = document.querySelector(".orderPage-table tbody");

//取得訂單資料
function getOrder() {
  axios.get(`${url}/orders`, headers).then((res) => {
    console.log(res.data.orders);
    orderData = res.data.orders;
    orderData.sort((a, b) => b.createdAt - a.createdAt);
    orderRender(orderData);
    calcProductTitle(orderData);
  });
}

//渲染訂單資料
function orderRender(data) {
  let orderTemplate = "";
  data.forEach((order) => {
    let productName = "";
    order.products.forEach((product) => {
      productName += `<p>${product.title} x ${product.quantity}</p>`;
    });
    orderTemplate += `<tr data-id=${order.id}>
              <td>${order.id}</td>
              <td>
                <p>${order.user.name}</p>
                <p>${order.user.tel}</p>
              </td>
              <td style="text-align: center">${order.user.address}</td>
              <td>${order.user.email}</td>
              <td>
                ${productName}
              </td>
              <td>${formatTime(order.createdAt)}</td>
                <td class="orderStatus" style="text-align: center">
    <a  style="text-decoration:none;" href="#">
      ${
        order.paid
          ? '<span class="orderStatus-Btn" style="color:green;">已處理</span>'
          : '<span class="orderStatus-Btn" style="color:red;">未處理</span>'
      }
    </a>
  </td>
              <td>
                <input type="button" class="delSingleOrder-Btn" value="刪除" />
              </td>
            </tr>`;
  });
  orderPageTableBody.innerHTML = orderTemplate;
}

//時間格式
function formatTime(timestamp) {
  const time = new Date(timestamp * 1000);
  return time.toLocaleString("zh-TW", { hour12: false });
}

//刪除單筆訂單
function deleteSingleOrder(id) {
  let deleteItem;
  orderData.forEach((item) => {
    if (item.id === id) {
      deleteItem = item;
    }
    return deleteItem;
  });
  Swal.fire({
    title: "刪除訂單",
    text: `您確定要刪除${deleteItem.user.name}的訂單`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "確定",
    cancelButtonText: "取消",
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .delete(`${url}/orders/${id}`, headers)
        .then((res) => {
          console.log(res.data.orders);
          orderData = res.data.orders;
          orderRender(orderData);
        })
        .catch((err) => {
          console.log(err.message);
        });
      Swal.fire({
        title: "訂單刪除成功",
        text: "您的訂單已刪除成功",
        icon: "success",
      });
    }
  });
}

//修改訂單狀態
function editOrderStatus(id) {
  let result = {};
  orderData.forEach((order) => {
    if (order.id === id) {
      result = order;
    }
  });
  console.log(result.paid);
  orderStatusData = {
    data: {
      id: id,
      paid: !Boolean(result.paid),
    },
  };
  axios
    .put(`${url}/orders`, orderStatusData, headers)
    .then((res) => {
      //   console.log(res.data.orders);
      orderData = res.data.orders;
      orderRender(orderData);
    })
    .catch((err) => {
      console.log(err.message);
    });
}

//監聽事件 點擊刪除單筆訂單、修改訂單狀態
orderPageTableBody.addEventListener("click", (e) => {
  e.preventDefault();
  console.log(e.target);
  const id = e.target.closest("tr").getAttribute("data-id");
  if (e.target.classList.contains("delSingleOrder-Btn")) {
    deleteSingleOrder(id);
  }
  if (e.target.classList.contains("orderStatus-Btn")) {
    editOrderStatus(id);
  }
});

//刪除全部訂單
function deleteAllOrder() {
  Swal.fire({
    title: "清除全部訂單",
    text: "您確定要清除全部訂單",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "確定",
    cancelButtonText: "取消",
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .delete(`${url}/orders`, headers)
        .then((res) => {
          console.log(res.data.orders);
          orderData = res.data.orders;
          orderRender(orderData);
        })
        .catch((err) => {
          console.log(err.message);
        });
      Swal.fire({
        title: "訂單清除成功",
        text: "您的訂單已全部清除成功",
        icon: "success",
      });
    }
  });
}

const discardAllBtn = document.querySelector(".discardAllBtn");

//監聽事件 點擊刪除全部訂單
discardAllBtn.addEventListener("click", (e) => {
  e.preventDefault();
  deleteAllOrder();
});

//LV2全品項營收比重
function calcProductTitle(data) {
  let productTitleObj = {};
  data.forEach((order) => {
    order.products.forEach((product) => {
      if (!productTitleObj[product.title]) {
        productTitleObj[product.title] = product.price * product.quantity;
      } else {
        productTitleObj[product.title] += product.price * product.quantity;
      }
    });
  });
  const productTitleArr = Object.entries(productTitleObj);
  const sortProductTitleArr = productTitleArr.sort((a, b) => b[1] - a[1]);
  const rank = [];
  let otherTotal = 0;
  sortProductTitleArr.forEach((item, index) => {
    if (index <= 2) {
      rank.push(item);
    }
    if (index > 2) {
      otherTotal += item[1];
    }
  });
  if (sortProductTitleArr.length > 3) {
    rank.push(["其他", otherTotal]);
  }
  console.log(rank);
  chartRender(rank);
}

//c3.js
function chartRender(data) {
  let chart = c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: data,
    },
    color: {
      pattern: ["#DACBFF", "#9D7FEA", "#5434A7", "#301E5F"],
    },
  });
}

//初始化
function init() {
  getOrder();
}
init();
