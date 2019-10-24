//
// Notes:
//    Can't use console.log() of background 
//
console.log("@Content:Loading");

var NewsSiteList = ["中央通訊社", "經濟日報", "中時電子報", "自由電子報", "TechNews", "ETtoday", "NowNews", "BusinessToday", "工商時報", 
                    "財訊", "TVBS", "COOL3C", "UDN", "CNYES", "CMoney", "Storm", "SETN", "BuzzOrange", "NewTalk", "BusinessWeekly", 
                    "中廣新聞網", "AppleDaily", "NextMag", "MoneyDJ", "BusinessNext", "IThome", "T客邦", "立場新聞", "xfastest", "東森新聞",
                    "ManagerToday"];
var ClipboardBuffer = false;

//-----------------------------------------------------------------------------
// Common functions
//-----------------------------------------------------------------------------
function isset(_var){
  return !!_var; // converting to boolean.
}

function GetMetaData(key1, value1, key2) {
  var result = false;
  var select = sprintf("meta[%s=\"%s\"]", key1, value1);
  try {
    result = document.querySelector(select)[key2];
  } catch (e) {
  }
  return result;
}

function NormalizeDateString(tstr) {
  var result = tstr;
  var p = tstr.indexOf(" ");
  if (p == -1) {
    var p = tstr.indexOf("T");
  }
  if (p != -1) {
    result = tstr.substring(0, p);
  }
  result = result.replace(/\//g, "-");
  result = result.replace(/\./g, "-");
  return result;
}

function NormalizeTitleString(tstr, tag = "|") {
  var tlist = tstr.split(tag);
  result = tlist[0].trim();
  return result;
}

class LdJsonClass {
  constructor() {
    this.Object = false;
    var items = document.getElementsByTagName("script");
    for(var i=0; i<items.length; i++) {
      var item = items[i];
      var type = item.getAttribute('type');
      if (type != null) {
        if (type.indexOf("json") != -1) {   // <script type="application/ld+json">
          var html = item.innerHTML;
          var jobj = JSON.parse(html);    
          if (isset(jobj.datePublished)) {
            this.Object = jobj;
            break;
          }
        }
      }
    }
  }
  
  GetDate() {
    var result = false;
    if (this.Object !== false) {
      result = this.Object.datePublished;
    }
    return result;
  }
}

function GetDateFromLdJson() {
  var jobj = new LdJsonClass();
  return jobj.GetDate();
}

//-----------------------------------------------------------------------------
// Page functions
//-----------------------------------------------------------------------------
$(document).ready(function () {
  // $('body').append('<textarea id="test"/>');
  // var $test = $('#test');
  // $test.text('some text which should appear in clipboard');
  // $test.select();
  console.log("@Content:Ready");
  //document.execCommand('copy');
  //alert('copied!');
});

document.addEventListener('copy', function(e) {
  if (ClipboardBuffer !== false) {
    e.clipboardData.setData('text/html', ClipboardBuffer);
    e.preventDefault();
    ClipboardBuffer = false;
  }
});

//-----------------------------------------------------------------------------
// News Site Class Defination
//-----------------------------------------------------------------------------
class NewsBaseClass {
  constructor() {
    this.site_name = false;          // TVBS
    this.domain_name = false;        // tvbs.com.tw
    this.title_break = "|";
    this.date_attribute_key = "property";
    this.date_attribute_value = "article:published_time";    
  }
  
  Test() {
    var st = false;
    var url = window.location.href;
    if (url.indexOf(this.domain_name) != -1) {
      st = true;
    }
    return st;
  }

  GetInfo() {
    var info = {};
    info.Site = GetMetaData("property", "og:site_name", "content");
    if (info.Site == false) {
      info.Site = this.site_name;
    }
    info.Title = GetMetaData("property", "og:title", "content");
    info.URL = GetMetaData("property", "og:url", "content");
    info.Date = GetMetaData(this.date_attribute_key, this.date_attribute_value, "content");
    if (info.Date == false) {
      info.Date = GetMetaData("itemprop", "datePublished", "content");
    }
    if (info.Date == false) {
      info.Date = GetMetaData("name", "date", "content");
    }
    if (info.Date == false) {
      info.Date = GetMetaData("name", "pubdate", "content");
    }
    if (info.Date == false) {
      info.Date = GetDateFromLdJson();
    }
    if (info.Date != false) {
      info.Date = NormalizeDateString(info.Date);
    }
    if (info.Title != false) {
      info.Title = NormalizeTitleString(info.Title, this.title_break);
    }
    return info;
  }
}

class 中央通訊社 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "中央通訊社";
    this.domain_name = "cna.com.tw";
    this.title_break = "|";
    this.date_attribute_key = "itemprop";
    this.date_attribute_value = "datePublished"; 
  }
}

class 經濟日報 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "經濟日報";
    this.domain_name = "money.udn.com";
    this.title_break = "|";
    this.date_attribute_key = "name";
    this.date_attribute_value = "date"; 
  }
}

class 中時電子報 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "中時電子報";
    this.domain_name = "chinatimes.com";
    this.title_break = "|";
    this.date_attribute_key = "name";
    this.date_attribute_value = "pubdate"; 
  }
}

class 自由電子報 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "自由電子報";
    this.domain_name = "ltn.com.tw";    
    this.title_break = "-";
    this.date_attribute_key = "name";
    this.date_attribute_value = "pubdate"; 
  }
}

class TechNews extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "TechNews 科技新報";
    this.domain_name = "technews.tw";
  }
  
  GetInfo() {
    var info = super.GetInfo();
    var url = info.URL;
    var tag = this.domain_name;
    var p1 = url.indexOf(tag)+tag.length+1;
    info.Date = url.substring(p1, p1+10); 
    info.Date = NormalizeDateString(info.Date);
    return info;
  }
}

class ETtoday extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "ETtoday 新聞雲";
    this.domain_name = "ettoday.net";
    this.date_attribute_key = "name";
    this.date_attribute_value = "pubdate"; 
  }
}

class NowNews extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "NowNews 今日新聞";
    this.domain_name = "nownews.com";
    this.date_attribute_key = "name";
    this.date_attribute_value = "publishedTime"; 
  }
}

class BusinessToday extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "今周刊";
    this.domain_name = "businesstoday.com.tw";
    this.title_break = "-";
  }
}

class 工商時報 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "工商時報";
    this.domain_name = "ctee.com.tw";
    this.title_break = "-";
  }
}

class 財訊 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "財訊";
    this.domain_name = "wealth.com.tw";
    this.title_break = "-";
  }
}

class TVBS extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "TVBS";
    this.domain_name = "tvbs.com.tw";
    this.title_break = "│";
  }
}

class COOL3C extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "癮科技 Cool3C";
    this.domain_name = "cool3c.com";
    this.title_break = "-";
  }
}

class UDN extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "聯合新聞網";
    this.domain_name = "https://udn.com";
    this.title_break = "|";
    this.date_attribute_key = "name";
    this.date_attribute_value = "date"; 
  }
}

class CNYES extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "鉅亨網";
    this.domain_name = "news.cnyes.com";
    this.title_break = "|";
  }
}

class CMoney extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "CMoney 投資網誌";
    this.domain_name = "cmoney.tw";
  }
}

class Storm extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "風傳媒";
    this.domain_name = "storm.mg";
    this.title_break = "-";
  }
}

class SETN extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "三立新聞網";
    this.domain_name = "setn.com";
  }
}

class BuzzOrange extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "科技報橘";
    this.domain_name = "buzzorange.com";
  }
  
  GetInfo() {
    var info = super.GetInfo();
    var date_string = false;                //<time class="entry-date published" datetime="2019-09-05T11:00:01+08:00">2019/09/05</time>
    var time_list = document.getElementsByTagName("time");
    for(var i=0; i<time_list.length; i++) {
      var item = time_list[i];
      var html = item.innerHTML;
      var datetime = item.getAttribute('datetime');
      if (datetime != null) {
        date_string = html;
        break;
      }
    }
    if (date_string != false) {
      info.Date = NormalizeDateString(date_string);      
    } else {
      info = false;
    }
    return info;
  }
}

class NewTalk extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "新頭殼";
    this.domain_name = "newtalk.tw";
  }
}

class BusinessWeekly extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "商周";
    this.domain_name = "businessweekly.com.tw";
  }
  
  GetInfo() {
    var info = super.GetInfo();
    var date_string = false;
    var span_list = document.getElementsByTagName("span");
    for(var i=0; i<span_list.length; i++) {
      var item = span_list[i];
      var html = item.innerHTML;
      var year = 0;
      html = html.trim();
      if (html.length > 4) {
        year = parseInt(html.substring(0, 4));
      }      
      if (html.indexOf(".") != -1 && html.length <= 10 && year > 1911) {
        date_string = html; 
        break;
      }
    }
    if (date_string != false) {
      info.Date = NormalizeDateString(date_string);      
    } else {
      info = false;
    }
    return info;
  }
}

class 中廣新聞網 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "中廣新聞網";
    this.domain_name = "bcc.com.tw";
  }

  GetInfo() {
    var info = super.GetInfo();
    var date_string = false;                // <div class="tt27">2019/07/24 11:22 報導</div>
    var div_list = document.getElementsByTagName("div");
    for(var i=0; i<div_list.length; i++) {
      var item = div_list[i];
      var html = item.innerHTML;
      var year = 0;
      html = html.trim();
      if (html.length > 4) {
        year = parseInt(html.substring(0, 4));
      }
      if (html.indexOf("/") != -1 && html.length <= 20 && year > 1911) {
        date_string = html.substring(0, 10); 
        break;
      }
    }
    if (date_string != false) {
      info.Date = NormalizeDateString(date_string);      
    } else {
      info = false;
    }
    return info;
  }
}

class AppleDaily extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "蘋果日報";
    this.domain_name = "tw.appledaily.com";
    this.title_break = "｜";    
  }

  GetInfo() {
    var info = super.GetInfo();
    var date_string = GetDateFromLdJson();
    if (date_string != false) {
      info.Date = NormalizeDateString(date_string);      
    } else {
      info = false;
    }
    return info;
  }
}

class NextMag extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "壹週刊";
    this.domain_name = "nextmag.com.tw";
  }
}

class MoneyDJ extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "MoneyDJ 理財網";
    this.domain_name = "moneydj.com";
    this.title_break = "-";
  }
}

class BusinessNext extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "數位時代";
    this.domain_name = "bnext.com.tw";
    this.title_break = "｜";
  }
}

class IThome extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "IThome";
    this.domain_name = "ithome.com.tw";
    this.title_break = "｜";
  }
  
  GetInfo() {
    var info = super.GetInfo();
    var date_string = false;
    var items = document.getElementsByTagName("span");
    for(var i=0; i<items.length; i++) {
      var item = items[i];
      var html = item.innerHTML;
      var year = 0;
      html = html.trim();
      if (html.length > 4) {
        year = parseInt(html.substring(0, 4));
      }      
      if (html.indexOf("-") != -1 && html.length <= 10 && year > 1911) {
        date_string = html; 
        break;
      }
    }
    if (date_string != false) {
      info.Date = NormalizeDateString(date_string);      
    } else {
      info = false;
    }
    return info;
  }
}

class T客邦 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "T客邦";
    this.domain_name = "techbang.com";
  }
}

class 立場新聞 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "立場新聞";
    this.domain_name = "thestandnews.com";
  }
}

class xfastest extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "xfastest";
    this.domain_name = "xfastest.com";    
  }
}

class 東森新聞 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "東森新聞";
    this.domain_name = "ebc.net.tw";    
  }
}

class ManagerToday extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "經理人";
    this.domain_name = "managertoday.com.tw";    
  }
  
  GetInfo() {
    var info = super.GetInfo();
    if (info.Date == false) {
      info.Date = GetMetaData("property", "article:published_time", "content");   // Why get failed when exists
      if (info.Date == false) {
        info.Date = GetMetaData("name", "my:date", "content");   
      }
    }    
    return info;
  }
}

//-----------------------------------------------------------------------------
// Message Receiver
//-----------------------------------------------------------------------------
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {    
  //
  // Get Information from News Class
  //
  var info = false;    
  for (let item of NewsSiteList) {
    var nobj = eval("new " + item + "()");
    if (nobj.Test()) {
      info = nobj.GetInfo();
      break;
    }
  }
  //
  // Try ld+json Mode if nothing
  //
  if (info == false) {
    var lobj = new LdJsonClass();
    if (lobj.Object !== false) {
      jobj = lobj.Object;
      info = {};
      info.Title = jobj.headline;
      info.Date = NormalizeDateString(jobj.datePublished);
      info.URL = jobj.url;
      info.Site = jobj.publisher.name;
    }
  }
  //
  // Try base Class if nothing
  //
  if (info == false) {
    var nobj = new NewsBaseClass();
    var data = nobj.GetInfo();
    if (data.Site !== false && data.URL !== false && data.Title !== false && data.Date !== false) {
      info = data;
    }
  }  
  //
  // Generate HTML formated data then set to clipboard
  //
  if (info !== false) {    
    if (request.mode == 0) {
      ClipboardBuffer = sprintf("%s, <a href='%s'>%s</a>", info.Date, info.URL, info.Title);
      document.execCommand('copy');
    } else if (request.mode == 1) {
      ClipboardBuffer = sprintf("<a href='%s'>%s</a>", info.URL, info.Title);
      document.execCommand('copy');
    } else {      
    }
  } else {
    alert('Info: Can\'t generate news link of the page'); 
  }
  //
  // Sample Code
  //
  //console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");  
  if (request.greeting == "hello") {
    sendResponse({farewell: "goodbye", info: info});
  }    
});