var cartItemCounter = 0,
    text = "";

// Prepare and initialize data with img src arrays
function initData(_data){
  _data['info_imgArr'] = [];
  _data['info_id'] = "select-man-id";
  _data['info_PHOption'] = "--Please Select Make--";

  for(var i in _data){
    if(i.indexOf("info")){
      if(_data[i].src){
        _data['info_imgArr'].push(_data[i].src);
      }
      _data[i].info_imgArr = [];
      _data[i].subItem['info_id'] = "select-model-id";
      _data[i].subItem['info_PHOption'] = "--Please Select Model--";

      for(var j in _data[i].subItem){

        if(_data[i].subItem[j].src){
          _data[i].info_imgArr.push(_data[i].subItem[j].src);
        }

        if(j.indexOf("info")){
          _data[i].subItem[j].info_imgArr = [];
          if( _data[i].subItem[j].subItem){
            _data[i].subItem[j].subItem['info_id'] = "select-trim-id";
            _data[i].subItem[j].subItem['info_PHOption'] = "--Please Trim Model--";
          }

          for(var h in _data[i].subItem[j].subItem){
            if(_data[i].subItem[j].subItem[h].src){
              // need to push src in
              _data[i].info_imgArr.push(_data[i].subItem[j].subItem[h].src);
              _data[i].subItem[j].info_imgArr.push(_data[i].subItem[j].subItem[h].src);
            }
          }
        }
      }
    }
  }
  return _data;
}

// function to initialize first select dropdown on page when page loads
// _data = JSON data
function init(_data){
  var data = initData(_data),
      btnPropArr = {
    "style":"font-size:18px;border-radius:2px;border:2px solid #7F1800;"
  };

  resetStage('output-div');
  clearImgs("mod-display");
  clearImgs("logo-display");
  createDD(null, data);
  animateMenuBtn('splash-div', btnPropArr);
}

// animates menu buttons
// _menuId = id of menu div
// _btnArr = JSON object of attributes to change
function animateMenuBtn(_menuId, _btnArr){
  var menu = $(_menuId);

  for(i in menu.children){
    // change size and other properties of input buttons
    
    if(menu.children[i].className == "splash-btn"){
      changeAttr(menu.children[i], _btnArr);
    }
  }
}

// clears out entire stage
// _divId = id of div to clear
function resetStage(_divId){
  var form = $("build-car-form"),
      outputDiv = $(_divId);

  manufacturerArr = [];
  manufacturerImgArr = [];
  modelsImgArr = [];
  modelsArr = [];

  while (form.firstChild) {
    form.removeChild(form.firstChild);
  }
  while (outputDiv.firstChild) {
    outputDiv.removeChild(outputDiv.firstChild);
  }
}

// create Images with attributes
// params: _arr - array of img source's, 
//         _divId - id of div to append created images to,
//          ex: createImgs(modelsArray, "div-id", "Subaru");
function createImgs(_arr, _divId){
  var view = $(_divId),
      imgArr = _arr,
      className = "";

  //need to clear out div before repopulating
  while (view.firstChild) {
    view.removeChild(view.firstChild);
  }

  if(_divId == "logo-display"){
    className = "logo-img";
  }
  else{
    className = "car-img";
  }
  if(_arr instanceof Array) {
    for (i in imgArr) {
      var imgProp = {
        "src": imgArr[i].replace(/ /g, "_"),
        "id": imgArr[i],
        "class": className
      };
      var createdImg = createEle('img', imgProp);
      view.appendChild(createdImg);
    }
  }
  else{
    var imgProp = {
      "src": imgArr.replace(/ /g, "_"),
      "id": imgArr,
      "class": className
      },
      createdImg = createEle('img', imgProp);
    view.appendChild(createdImg);
  }
}

// removes images from view to then load more images
// _divId = id of div to remove img's from
function clearImgs(_divId){
  var div = $(_divId);
  while (div.hasChildNodes()) {
    div.removeChild(div.lastChild);
  }
}

// adds item to cart
function addToCart(){
  var advOpt = $("adv-opt-sel"),
      yearOpt = $("year-sel"),
      errMsgForDate = "Please Select a Date",
      errMsgForAdvOpt = "Please Select Advanced Option",
      imgSrc = $("add-to-cart-btn").getAttribute("data-src"),
      carInfo = $("add-to-cart-btn").getAttribute("data-info");

  if($("select-adv-opt-div").hasChildNodes()){
    if(advOpt.options[advOpt.selectedIndex].value){
      var yearOptVal = yearOpt.options[yearOpt.selectedIndex].value,
          advOptVal = advOpt.options[advOpt.selectedIndex].value,
          purchase = {
            "info":carInfo,
            "src":imgSrc,
            "advOpt":advOptVal,
            "year":yearOptVal
          },
          msg = carInfo + " : added to cart.",
          time = new Date().getTime() / 1000,
          key = "purchase_" + carInfo.replace(/ /g, "_") + "_time_" + time;

      storeItem(key, JSON.stringify(purchase));
      var retrievedObject = retrieveItem(key);
      updateCartDiv(key, retrievedObject);
      updateCartNum();
      showMessage("msg-panel", msg, 5000);
      return true;
    }
    else{
      showMessage("msg-panel", errMsgForAdvOpt, 5000);
      return false;
    }
  }
  else{
    showMessage("msg-panel", errMsgForDate, 5000);
    return false
  }
}

//loads cart div onLoad from storage
function preloadCart(){
  if(window.localStorage){
    for(var i in localStorage){
      updateCartDiv(i, localStorage[i]);
    }
    updateCartNum();
  }
  else{
    var cookies = getCookiesArray();
    for(var i in cookies){
      updateCartDiv(i, cookies[i]);
    }
    updateCartNum();
  }
}

// removes item from cart (storage and from view)
// _key = string with date and purchase info
// _purchaseInfo = json object with purchase info
function removeItemFromCart(_key, _purchaseInfo){
  var eleToKill = $(_key),
      msg = _purchaseInfo.info + " : removed from cart.";
      log(_purchaseInfo);
  eleToKill.parentNode.removeChild(eleToKill);
  cartItemCounter--;
  updateCartNum();
  showMessage("msg-panel", msg, 5000);
  removeItem(_key);
}

// updates items in cart
// _key = string with date and purchase info
// _purchaseInfo = json object with purchase info
function updateCartDiv(_key, _purchaseInfo){
  cartItemCounter++;
  var purchaseInfo = _purchaseInfo.replace(".png", ""),
      purchaseInfo = JSON.parse(_purchaseInfo),
      cartDiv = $("cart-div"),
      imgPropArr = {
        "src": purchaseInfo.src,
        "class":"cart-img"
      },
      divPropArr = {
        "class":"cart-img-cont",
        "id":_key
      },
      spanPropArr = {
        "class":"cart-span"
      },
      btnPropArr = {
        "type":"button",
        "value":"Remove",
        "class":"remove-cart-btn"
      },
      imgDivPropArr = {
        "class":"cart-img-div"
      },
      div = createEle("div", divPropArr),
      imgDiv = createEle("div", imgDivPropArr),
      carImg = createEle("img", imgPropArr),
      span = createEle("span", spanPropArr),
      btn = createEle("input", btnPropArr),
      br = createEle("br"),
      br2 = createEle("br"),
      infoStr = purchaseInfo.info,
      info = createTxt(infoStr);

  addListener(btn, "click", function(){
    removeItemFromCart(_key, purchaseInfo);
  });
  span.appendChild(info);
  imgDiv.appendChild(carImg);
  imgDiv.appendChild(btn);
  div.appendChild(imgDiv);
  div.appendChild(span);
  div.appendChild(br);
  div.appendChild(br2);
//  div.appendChild(btn);
  cartDiv.appendChild(div);
}

// updates number of items in cart
function updateCartNum(){
  var numItemsDiv = $("cart-item-num"),
      numItemsSpan = createEle("span"),
      emptyCartH3 = createEle("h3"),
      emptyCartSpan = createTxt("Your Cart is Empty"),
      numItemsTxt = createTxt(cartItemCounter + ""),
      cartDiv = $("cart-div");

  if(cartItemCounter == 0){
    emptyCartH3.appendChild(emptyCartSpan);
    cartDiv.appendChild(emptyCartH3);
  }

  while (numItemsDiv.firstChild) {
    numItemsDiv.removeChild(numItemsDiv.firstChild);
  }

  numItemsSpan.appendChild(numItemsTxt);
  numItemsDiv.appendChild(numItemsSpan);
}

// creates entire view for final choice with extra options and form
// _c1 = choice #1
// _c2 = choice #2
// _c3 = choice #3
// _divId = id of div to append all create elements to
// _imgSrc = src of image of chosen car
function showFinalChoice(_divId, _imgSrc){
  var imgId = _imgSrc.replace("_thumb", ""),
      eleId = $(imgId),
      attrArr = {
        "class":"large-car-img"
      },
      carName = _imgSrc,
      imgSrc;

  carName = carName.replace("_thumb.png", "");
  carName = carName.replace(".png", "");
  carName = carName.replace("img/", "");
  carName = carName.replace(/_/g, " ");
  imgSrc = _imgSrc.replace("_thumb", "");

  var str = "You chose a " + carName,
      outputDiv = $(_divId),
      text = createTxt(str);

  while (outputDiv.firstChild) {
    outputDiv.removeChild(outputDiv.firstChild);
  }
  var selYearDivAttrArr = {
        "id":"select-year-div"
      },
      selAdvOptDivAttrArr = {
        "id":"select-adv-opt-div"
      },
      atcBtnAttrArr = {
        "type":"submit",
        "value":"Add to Cart",
        "id":"add-to-cart-btn",
        "class":"red-white",
        "data-src":imgSrc,
        "data-info":carName
      },
      spanAttrArr = {
        "style":"overflow-x:auto;"
      },
      selectYearDiv = createEle("div", selYearDivAttrArr),
      selectAdvOptDiv = createEle("div", selAdvOptDivAttrArr),
      addToCartBtn = createEle("input", atcBtnAttrArr),
      span = createEle("span", spanAttrArr),
      br = createEle("br"),
      br2 = createEle("br");

  changeAttr(eleId, attrArr);

  // add corresponding data to selected IMG
  span.appendChild(text);
  outputDiv.appendChild(span);
  outputDiv.appendChild(br);
  outputDiv.appendChild(selectYearDiv);
  outputDiv.appendChild(selectAdvOptDiv);
  outputDiv.appendChild(br2);
  outputDiv.appendChild(addToCartBtn);
}

// create dropdowns
// _ele = select that was changed
// _prevObj = object iterated through to create options for select that was changed
function createDD(_ele, _prevObj){
  var currObj,
      div = createEle("div"),
      select = createEle("select"),
      form = $("build-car-form"),
      mainDisp = $("main-display"),
      phOption = createEle("option"),
      text,
      outputDiv = $("output-div"),
      prevObj,
      firstChoice,
      secondChoice,
      thirdChoice;

  if(!_ele){
    _obj = _prevObj;
    text = createTxt(_obj.info_PHOption);
    currObj = _obj;

    // creates logo images
    createImgs(currObj.info_imgArr, "logo-display");
  }
  else if(_ele){
    // removes trailing elements
    while ($(_ele.id).parentNode != $('build-car-form').lastChild) {
      $('build-car-form').removeChild($('build-car-form').lastChild);
    }

    var _obj = _ele.options[_ele.selectedIndex].value,
      _imgSrc = _ele.options[_ele.selectedIndex].getAttribute("data-src");

    prevObj = eval(_prevObj);
    if(prevObj[_obj].subItem != 'undefined') {
      currObj = prevObj[_obj].subItem;

      //deal with logo images
      // if the user selected a manufacturer
      if ($('select-man-id').options[$('select-man-id').selectedIndex].value) {
        firstChoice = $('select-man-id').options[$('select-man-id').selectedIndex].value;
        // if model select does not exist
        if (!$('select-model-id')) {
          createImgs($('select-man-id').options[$('select-man-id').selectedIndex].getAttribute("data-src"), "logo-display");
          // need to populate with all images of a manufacturer
          createImgs(prevObj[_obj].info_imgArr, "mod-display");
        }
        // if user selected a model
        else if ($('select-model-id').options[$('select-model-id').selectedIndex].value) {
          secondChoice = $('select-model-id').options[$('select-model-id').selectedIndex].value;

          // if trim select does not exist yet
          if (!$('select-trim-id')) {
            if(prevObj[_obj].src){
              var imgSrc = $('select-model-id').options[$('select-model-id').selectedIndex].getAttribute('data-src'),
                  edmundsModel = $('select-model-id').options[$('select-model-id').selectedIndex].getAttribute('data-edmunds');
              imgSrc = imgSrc.replace("_thumb", "");
              createImgs(imgSrc, "mod-display");
              buildUrl(firstChoice, edmundsModel);
              showFinalChoice("output-div", prevObj[_obj].src);
              console.log('post show final');
            }
            // if trim select does exist
            else {
              createImgs(prevObj[_obj].info_imgArr, "mod-display");
            }
          }
          // if user has selected trim
          else if ($('select-trim-id').options[$('select-trim-id').selectedIndex].value) {
            var imgSrc = $('select-trim-id').options[$('select-trim-id').selectedIndex].getAttribute('data-src');
            imgSrc = imgSrc.replace("_thumb", "");
            thirdChoice = $('select-trim-id').options[$('select-trim-id').selectedIndex].value;
            createImgs(imgSrc, "mod-display");

            buildUrl(firstChoice, secondChoice);
            showFinalChoice("output-div", imgSrc);
          }
        }
      }

      // if this currObj is an object
      if (currObj instanceof Object) {
        text = createTxt(prevObj[_obj].subItem.info_PHOption);
      }
    }
  }

  if(currObj instanceof Object){
    while (outputDiv.firstChild) {
      outputDiv.removeChild(outputDiv.firstChild);
    }
    phOption.appendChild(text);
    phOption.value = "";
    select.appendChild(phOption);
    select.id = currObj.info_id;

    for(var i in currObj){

      if(i.indexOf("info")){
        var option = createEle("option"),
          textNode = currObj[i].name.replace(/_/g, " ");
          text = createTxt(textNode);

        option.appendChild(text);
        option.value = currObj[i].name;
        option.setAttribute('data-src', currObj[i].src);
        if(currObj[i].edmunds){
          option.setAttribute('data-edmunds', currObj[i].edmunds);
        }
        select.appendChild(option);
      }
    }
    addListener(select, "change", function(){
      createDD(select, currObj);
    });

    div.appendChild(select);
    form.appendChild(div);
  }
}
