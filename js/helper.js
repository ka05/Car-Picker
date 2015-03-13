//---------------------------------------------------
// HELPER FUNCTIONS
//---------------------------------------------------

// creates any element with attirbutes
// _ele = type of element to create
// _propObj = JSON object of properties to change
// accounts for IE7 by using "className" instead of "class"
function createEle(_ele, _propObj){
  var newEle = document.createElement(_ele);
  for(var i in _propObj){
    if(ieSeven == true){
      if(i == "class"){
        var i = "className";
        newEle.setAttribute(i, _propObj["class"]);
      }
      else{
        newEle.setAttribute(i, _propObj[i]);
      }
    }
    else{
      newEle.setAttribute(i, _propObj[i]);
    }
  }
  return newEle;
}

// creates a text Node
// _txt = string to be created
function createTxt(_txt){
  return document.createTextNode(_txt);
}

// basic getElementById selector
// id = id of element to get
function $(id){
  return document.getElementById(id);
}

// basic getElementsByTagName selector
// _tag = type/tag of element to get
// _index = which tag to get out of array of tags
// _parent = if this is being chained
function $$(_tag, _index, _parent){
  if(_parent){
    return _parent.getElementsByTagName(_tag)[_index];
  }
  if(!_parent){
    return document.getElementsByTagName(_tag)[_index];
  }
}

// funct to determine if element is in an array
// _item = thing we are searching for
// _array = array we are searching through
function inArray(_item, _array) {
  var length = _array.length;
  for(var i = 0; i < length; i++) {
   if(_array[i] == _item) return true;
  }
  return false;
}

// development helper log funct - delete after use to reduce file size
function log(_val){
  return console.log(_val);
}

// changes attributes of an element
// _ele = element to be changed
// _propObj = JSON object of attributes to change
function changeAttr(_ele, _propObj){
  console.dir(_ele);
  for(i in _propObj){
    if(ieSeven == true){
      if(i == "class"){
        var i = "className";
        _ele.setAttribute(i, _propObj["class"]);
      }
      else{
        _ele.setAttribute(i, _propObj[i]);
      }
    }
    else{
      _ele.setAttribute(i, _propObj[i]);
    }
  }
  console.dir(_ele);
}

// adds event listener to any element
// _ele = element that listener is added to
// _type = event type
// _function = annonymous function to occur on event
function addListener(_ele, _type, _function){
  if(ieSeven == true){
    _type = "on" + _type;
  }
  if(_ele.addEventListener){
    _ele.addEventListener(_type, _function);
  }
  else if(_ele.attachEvent){
    _ele.attachEvent(_type, _function);
  }
}

//---------------------------------------------------
// STORAGE CODE
//---------------------------------------------------

// store an item
function storeItem(_key, _value){
  if(window.localStorage){
    localStorage.setItem(_key, _value);
  }
  else{
    SetCookie(_key, _value);
  }
}

// get an item
function retrieveItem(_item){
  if(window.localStorage){
    return localStorage.getItem(_item);
  }
  else{
    return GetCookie(_item);
  }
}

// remove an item
function removeItem(_key){
  if(window.localStorage){
    localStorage.removeItem(_key);
  }
  else{
    deleteCookie(_key);
  }
}

// delete cookie
function deleteCookie( name ) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

// makes ajax request
// _typeToBuild =
// _make =
// _model =
function loadJSON(_url, _typeToBuild, _make, _model){
  var data_file = _url;
  var http_request = new XMLHttpRequest();
  try{
    // Opera 8.0+, Firefox, Chrome, Safari
    http_request = new XMLHttpRequest();
  }catch (e){
    // Internet Explorer Browsers
    try{
      http_request = new ActiveXObject("Msxml2.XMLHTTP");
    }catch (e) {
      try{
        http_request = new ActiveXObject("Microsoft.XMLHTTP");
      }catch (e){
        // Something went wrong
        alert("Your browser broke!");
        return false;
      }
    }
  }
  http_request.onreadystatechange  = function(){
    if (http_request.readyState == 4  ){
      // Javascript function JSON.parse to parse JSON data

      var jsonObj = JSON.parse(http_request.responseText);

      if(_typeToBuild){
        buildStuffFromJSON(jsonObj, _typeToBuild, _make, _model);
      }
      else{
         buildStuffFromJSON(jsonObj);
      }
    }
  };

  http_request.open("GET", data_file, true);
  http_request.send();
}

// builds url string to be passed into loadJSON
// _make, _model, _year (self explanatory)
function buildUrl(_make, _model, _year){
  var url,
      urlStringPartial = _make.toLowerCase() + "/" + _model.toLowerCase(),
      model = _model.toLowerCase();

  if(_year){
    model = model.replace(/ /g, "-");
    url = "http://api.edmunds.com/v1/api/vehicle/" + _make.toLowerCase() + "/" + model + "/" + _year + "?api_key=deuxeshuaayk562p7aszzhzg&fmt=json";
    return loadJSON(url, "adv-options");
  }
  else if(!_year){
    url = "http://api.edmunds.com/api/vehicle/v2/" + urlStringPartial  + "?fmt=json&api_key=deuxeshuaayk562p7aszzhzg";
    return loadJSON(url, "year", _make, _model);
  }
}

// builds more select dropdowns for
function buildStuffFromJSON(_JSONObj, _typeToBuild, _make, _model){
  var carInfo = _JSONObj,
      styles,
      styleArr = [],
      carYears =[];

  // if we are building select of avaliable advanced options
  if(_typeToBuild == "adv-options"){
    if(carInfo.modelYearHolder){
      styles = carInfo.modelYearHolder[0].styles;
    }

    for(i in styles){
      styleArr.push(styles[i].name);
    }
    // builds select for advanced options
    buildSelect(styleArr, "select-adv-opt-div", "adv-opt-sel", false, false, _make, _model);
  }
  else if(_typeToBuild == "year"){

    // if we are building select of avaliable years
    for(i in carInfo.years){
      carYears.push(carInfo.years[i].year);
    }
    buildSelect(carYears, "select-year-div", "year-sel", true, false, _make, _model);
  }
}

function buildSelect(_obj, _divId, _idToSet, _hasEventListener, _retrieveCarData, _make, _model){
  var select = createEle("select"),
      divToAppendTo = $(_divId),
      phOption = createEle("option"),
      text;

  // if div has select wipe it out
  if(divToAppendTo.hasChildNodes()){
    while (divToAppendTo.firstChild) {
      divToAppendTo.removeChild(divToAppendTo.firstChild);
    }
  }
  text = createTxt("--Select an Advanced Trim--");
  if(_retrieveCarData == true){
    buildUrl(_make, _model, _obj);
  }
  if(_hasEventListener == true){
    text = createTxt("--Select a Year--");
    if(select.addEventListener){
      select.addEventListener('change', function(){ buildSelect( select.options[select.selectedIndex].value, "select-adv-opt-div", "adv-opt-sel", false, true, _make, _model) });
    }
    else if(select.attachEvent){
      select.attachEvent('onchange', function(){ buildSelect( select.options[select.selectedIndex].value, "select-adv-opt-div", "adv-opt-sel", false, true, _make, _model) });
    }
  }
  // add placeholder
  phOption.appendChild(text);
  phOption.value = "";
  select.appendChild(phOption);

  for(var i in _obj){
    var option = createEle("option"),
          text = createTxt(_obj[i]);

    option.appendChild(text);
    option.value = _obj[i];
    select.appendChild(option);
  }
  select.setAttribute("id", _idToSet);
  divToAppendTo.appendChild(select);
}

// for testing purposes to discover and learn edmunds api
function runURL(_make){
  var url;
  url = "http://api.edmunds.com/v1/api/vehicle-directory-ajax/findmakemodels?make=" + _make + "&api_key=deuxeshuaayk562p7aszzhzg&fmt=json";
  return loadJSON(url);
}

//-----------------------------------------------------------------------
// ANIMATE TOGGLE CART CODE
//-----------------------------------------------------------------------

// hides/shows the cart div.
// _eleId = id of element to be toggled (in this case the cart container)
function toggleCart(_eleId){
  var cartDisp = $(_eleId);
  if(parseInt(cartDisp.style.height) == 161){
    shrink(_eleId);
    cartDisp.style.boxShadow = "";
  }
  else{
    cartDisp.style.height = "1px";
    grow(_eleId);
    cartDisp.style.boxShadow = "0px 0px 8px 2px #000";
  }
}

// animates shrinking the height of the element that is passed in
// _eleId = id of element to be animated
function shrink(_eleId){
  var cartDisp = $(_eleId),
      currHeight = parseInt(cartDisp.style.height);

  if(currHeight > 1){
    cartDisp.style.height = currHeight - 2 + "px";
    setTimeout(function(){ shrink(_eleId) },.1 );
  }
}

// animates enlarging the height of the element that is passed in
// _eleId = id of element to be animated
function grow(_eleId){
  var cartDisp = $(_eleId),
      currHeight = parseInt(cartDisp.style.height);

  if(currHeight < 161){
    cartDisp.style.height = currHeight + 2 + "px";
    setTimeout(function(){ grow(_eleId) },.1 );
  }
}

//-----------------------------------------------------------------------
// SHOW MESSAGE POPUP CODE
//-----------------------------------------------------------------------

// displays a message to user when error has occurred or when item has been added to cart.
// _eleId = id of element that message gets added to
// _message = any string containing a message to be displayed
// _timeout =
function showMessage(_eleId, _message, _timeout) {
  divload = $(_eleId);
  if (divload) {
    getViewPort();
    var _divPropArr = {
          "class":"loading-div"
        },
        loadDiv = createEle("div", _divPropArr),
        msg = createTxt(_message);

    while (divload.firstChild) {
      divload.removeChild(divload.firstChild);
    }

    loadDiv.appendChild(msg);
    divload.appendChild(loadDiv);
    newHalfWidth = parseInt(divload.offsetWidth)/2;
    divload.style.left = (XScrollLeft+(VPwidth/2-newHalfWidth))+'px';
    divload.style.visibility='visible';

    if (_timeout != 0) {
      idname2 = _eleId;
      setTimeout(function(){ tryToggleOff(idname2) }, _timeout);
    }
  }
  return false;
}

// gets current view port to display things in the center
function getViewPort() {
  if(ieSeven){
    VPwidth = ieViewPort().clientWidth;
    VPheight = ieViewPort().clientHeight;
    XScrollLeft = ieViewPort().scrollLeft;
    YScrollTop = ieViewPort().scrollTop;
  }
  else{
    // compute viewport situation
    VPwidth = window.innerWidth;
    VPheight = window.innerHeight;
    XScrollLeft = window.pageXOffset;
    YScrollTop = window.pageYOffset;
  }
}

function ieViewPort() {
  return (document.compatMode && document.compatMode.indexOf("CSS")!=-1)? document.documentElement : document.body;
}

// hide/show element
// _eleId = id of element to hide/show
function tryToggleOff(_eleId) {
  paneObj=$(_eleId);

  var ele = $( '#'+_eleId+'2' );
  if ( ele ) {
    ele.parentNode.removeChild( ele );
  }
  if (paneObj && paneObj.style.visibility=='visible') {
    paneObj.style.visibility='hidden';
    return true;
  }
  else
    return false;
}

//-----------------------------------------------------------------------
// SCROLL FUNCTIONALITY
//-----------------------------------------------------------------------

//NOTES:
// IN IE7
// fix header not alligning left
// btn size smaller


// changes attributes and styles of elements in header
function scrollFunct(){
  var distanceY = window.pageYOffset || document.documentElement.scrollTop,
    shrinkOn = 100,
    isSmall = false,
    header = $("header"),
    manLinks = $("splash-div"),
    splashH3 = $("splash-h3"),
    logoDiv = $("logo-display"),
    splashBtns = $("splash-div").getElementsByTagName("input");

  if (distanceY > shrinkOn) {
    header.className = "active-header active-small-left";
    manLinks.className = "active-small";
    splashH3.style.display = "none";
    logoDiv.style.marginTop = "260px";

    for(i in splashBtns){
      splashBtns[i].className = "splash-btn white-red";
    }
  }
  if(distanceY < shrinkOn){
    header.className = "active-header";
    manLinks.className = "";
    splashH3.style.display = "block";
    logoDiv.style.margin = "10px";

    for(i in splashBtns){
      splashBtns[i].className = "splash-btn red-white";
    }
  }
}

// event listener
addListener(window, "scroll", function(){
  scrollFunct();
});