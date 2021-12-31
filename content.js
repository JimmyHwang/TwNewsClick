//
// Notes:
//    Can't use console.log() of background 
//
console.log("@Content:Loading");

var NewsSiteList = ["中央通訊社", "經濟日報", "中時電子報", "自由電子報", "TechNews", "ETtoday", "NowNews", "BusinessToday", "工商時報", 
                    "財訊", "TVBS", "COOL3C", "UDN", "CNYES", "CMoney", "Storm", "SETN", "BuzzOrange", "NewTalk", "BusinessWeekly", 
                    "中廣新聞網", "AppleDaily", "NextMag", "MoneyDJ", "BusinessNext", "IThome", "T客邦", "立場新聞", "xfastest", "東森新聞",
                    "ManagerToday", "必聞網", "科技產業資訊室", "Yahoo股市", "Yahoo新聞", "Yahoo理財", "MSN財經", "LEDInside", "EETTaiwan", 
                    "康健雜誌", "太報", "PChome股市", "端傳媒"];
var ClipboardBuffer = false;
var DebugFlags = 0;
var ExtConfig = {};

ExtConfigStartup();

//-----------------------------------------------------------------------------
// Common functions
//-----------------------------------------------------------------------------
function is_numeric(mixed_var) {  
  return !isNaN(mixed_var * 1);  
}

function isset(_var){
  return !!_var; // converting to boolean.
}

function json_decode(jstr) {
  var jobj = JSON.parse(jstr);
  return jobj;
}

function json_encode(jobj) {
  var jstr = JSON.stringify(jobj);
  return jstr;
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

function TimeStampToDateString(stamp) {
  var dstr = new Date(stamp*1000).toLocaleDateString("en-US")
  var temp = dstr.split("/");
  var result = temp[2] + "-" + temp[0] + "-" + temp[1];
  return result;
}

//
// The function for fix "\n" exists in data cause json decode failed issue
//
function FixInvalidCharacterInJson(html) {
  var i = 0;
  var offset = 0;
  var t1;
  var t2;
  var data;
  
  do { 
    t1 = html.indexOf('"', offset);
    if (t1 == -1) {
      break;
    }
    t2 = html.indexOf('"', t1+1);
    if (t2 == -1) {
      break;
    }
    var data = html.substring(t1+1, t2);
    if (data.indexOf("\n") != -1) {
      var l1 = data.length;
      data = data.replace("\n", "<br>");
      var l2 = data.length;
      var s1 = html.substring(0, t1+1);
      var s3 = html.substring(t2);
      html = s1+data+s3;
      t2 += l2 - l1;
    }
    offset = t2 + 1;
  } while (true);
  
  return html;
}

class LdJsonClass {
  constructor() {
    this.Object = false;
    var items = document.getElementsByTagName("script");
    var jobj;
    for(var i=0; i<items.length; i++) {
      var item = items[i];
      var type = item.getAttribute('type');
      if (type != null) {
        if (type.indexOf("json") != -1) {   // <script type="application/ld+json">
          var html = FixInvalidCharacterInJson(item.innerHTML);
          try {
            jobj = JSON.parse(html);
          } catch(e) {
            console.log("html="+html);
            jobj = {};
          }          
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

function GetDateFromSpan() {
  var result = false;
  var spanArray = document.getElementsByTagName('span');
  for (var s=0; s<spanArray.length; s++) {
    var spanText = spanArray[s].innerHTML;
    var p1 = spanText.indexOf("/", 0);
    var p2 = -1;
    var p3 = -1;
    if (p1 != -1 && p1 < 8) {
      p2 = spanText.indexOf("/", p1+1);
      if (p2 != -1) {
        p3 = spanText.indexOf(":", p2+1);
      }
    }
    if (p1 != -1 && p2 != -1 && p3 != -1) {
      p3 = spanText.indexOf(" ", p2+1);
      result = spanText.substring(0, p3);
    }
  }
  return result;
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
    var domain_list = this.domain_name.split("|");
    for (var i=0; i<domain_list.length; i++) {
      var domain_name = domain_list[i];
      if (url.indexOf(domain_name) != -1) {
        st = true;
        break;
      }      
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
    if (info.Date == false) {
      info.Date = GetDateFromSpan();    // for wealth.com.tw
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
    var tag = "更新時間：";
    var info = super.GetInfo();
    var date_string = false;
    var span_list = document.getElementsByTagName("span");
    for(var i=0; i<span_list.length; i++) {
      var item = span_list[i];
      var html = item.innerHTML;
      var year = 0;
      html = html.trim();
      var p = html.indexOf(tag);
      if (p != -1) {                    // <span class='writter'>撰文者：恩汎理財投資團隊　更新時間：2016-11-17</span>
        p +=  tag.length;
        html = html.substr(p);
        info.Title = info.Title.replace(" - Smart自學網","");
      }      
      if (html.length > 4) {
        year = parseInt(html.substring(0, 4));
      }      
      html = html.replace(".", "-");
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

class 必聞網 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "必聞網";
    this.domain_name = "biwennews.com";    
  }
  
  GetInfo() {
    var info = super.GetInfo();
    var date_string = false;                // <time datetime="2019-08-14 01:19:00">2019-08-14 01:19:00</time> 
    var div_list = document.getElementsByTagName("time");
    for(var i=0; i<div_list.length; i++) {
      var item = div_list[i];
      var html = item.getAttribute("datetime");
      var year = 0;
      html = html.trim();
      if (html.length > 4) {
        year = parseInt(html.substring(0, 4));
      }
      if (html.indexOf("-") != -1 && html.length <= 20 && year > 1911) {
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

class 科技產業資訊室 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "科技產業資訊室";
    this.domain_name = "iknow.stpi.narl.org.tw";    
  }
  
  GetInfo() {
    var html;
    var info = super.GetInfo();    
    var date_string = false;
    var div_list = document.getElementsByTagName("span");
    for (var i=0; i<div_list.length; i++) {
      var item = div_list[i];
      var id = item.getAttribute("id");
      if (id != null) {
        if (id.indexOf("CreateTime") != -1) {
          html = item.innerHTML;
          var p = html.indexOf("於");
          html = html.substr(p+1);
          html = html.replace("年", "-");
          html = html.replace("月", "-");
          html = html.replace("日", "");
          var year = 0;
          html = html.trim();
          if (html.length > 4) {
            year = parseInt(html.substring(0, 4));
          }
          if (html.indexOf("-") != -1 && html.length <= 20 && year > 1911) {
            date_string = html.substring(0, 10); 
            break;
          }
        }
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

class Yahoo股市 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "Yahoo股市";
    this.domain_name = "tw.stock.yahoo.com";
  }
  
  GetInfo() {
    var html;
    var info = super.GetInfo();    
    var date_string = false;
    var div_list = document.getElementsByTagName("span"); //<span class="t1">2019/11/02 09:40</span>
    for (var i=0; i<div_list.length; i++) {
      var item = div_list[i];
      var c = item.getAttribute("class");
      if (c != null) {
        if (c == "t1") {
          html = item.innerHTML;
          html = html.replace("/", "-");
          var year = 0;
          html = html.trim();
          if (html.length > 4) {
            year = parseInt(html.substring(0, 4));
          }
          if (html.indexOf("-") != -1 && html.length <= 20 && year > 1911) {
            date_string = html.substring(0, 10); 
            break;
          }
        }
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

class Yahoo新聞 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "Yahoo新聞";
    this.domain_name = "tw.news.yahoo.com";
  }
  
  GetInfo() {
    var html;
    var info = super.GetInfo();    
    var date_string = false;
    var div_list = document.getElementsByTagName("time");
    for (var i=0; i<div_list.length; i++) {
      var item = div_list[i];
      var attr = item.getAttribute("datetime");
      if (attr != null) {
        html = attr
        html = html.replace("/", "-");
        var year = 0;
        html = html.trim();
        if (html.length > 4) {
          year = parseInt(html.substring(0, 4));
        }
        if (html.indexOf("-") != -1 && html.length <= 32 && year > 1911) {
          date_string = html.substring(0, 10); 
          break;
        }
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

class MSN財經 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "MSN財經";
    this.domain_name = "www.msn.com/zh-tw";    
  }
  
  GetInfo() {
    var html;
    var info = super.GetInfo();    
    var date_string = false;
    var div_list = document.getElementsByTagName("time"); //<time datetime="2019-05-02T05:30:10.000Z">2019/5/2</time>
    for (var i=0; i<div_list.length; i++) {
      var item = div_list[i];
      var attr = item.getAttribute("datetime");
      if (attr != null) {
        html = attr;
        var year = 0;
        html = html.trim();
        if (html.length > 4) {
          year = parseInt(html.substring(0, 4));
        }
        if (html.indexOf("-") != -1 && html.length <= 32 && year > 1911) {
          date_string = html.substring(0, 10); 
          break;
        }
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

class LEDInside extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "LEDInside";
    this.domain_name = "ledinside.com.tw";    
  }
  
  GetInfo() {
    var html;
    var info = super.GetInfo();    
    var date_string = false;
    var div_list = document.getElementsByTagName("div"); //<div class="submitted">2019-10-14 18:23 [編輯：YiningChen]</div>
    for (var i=0; i<div_list.length; i++) {
      var item = div_list[i];
      var attr = item.getAttribute("class");
      if (attr != null && attr == "submitted") {
        html = item.innerHTML;
        var year = 0;
        html = html.trim();
        if (html.length > 4) {
          year = parseInt(html.substring(0, 4));
        }
        if (html.indexOf("-") != -1 && html.length <= 64 && year > 1911) {
          date_string = html.substring(0, 10); 
          break;
        }
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
  
class EETTaiwan extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "EETTaiwan";
    this.domain_name = "eettaiwan.com";
    this.title_break = "-";
  }
  
  GetInfo() {
    var html;
    var date_string = false;
    var info = super.GetInfo();
    if (info.URL == false) {
      info.URL = window.location.href;
    }
    var tag = "publishedDate";
    var markup = document.documentElement.innerHTML;
    var p = markup.indexOf(tag);
    if (p != -1) {
      var year;
      var offset = p+tag.length+1;
      var p1 = markup.indexOf('"', offset);
      var p2 = markup.indexOf('"', p1+1);
      p1 = p1 + 1;
      var html = markup.substr(p1, p2-p1);
      html = html.trim();
      if (html.length > 4) {
        year = parseInt(html.substring(0, 4));
      }
      if (html.indexOf("-") != -1 && html.length <= 64 && year > 1911) {
        date_string = html.substring(0, 10); 
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

class 康健雜誌 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "康健雜誌";
    this.domain_name = "commonhealth.com.tw";
    this.title_break = "-";
  }
  
  GetInfo() {
    var html;
    var date_string = false;
    var info = super.GetInfo();
    if (info.URL == false) {
      info.URL = window.location.href;
    }
    var span_list = document.getElementsByTagName("span");
    for(var i=0; i<span_list.length; i++) {
      var item = span_list[i];
      var html = item.innerHTML;
      var year = 0;
      html = html.trim();
      if (html.length > 4) {
        year = parseInt(html.substring(0, 4));
      }      
      html = html.replace("/", "-");
      html = html.replace(".", "-");
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

class 太報 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "太報";
    this.domain_name = "taisounds.com";
    this.title_break = "-";
  }
  
  GetInfo() {
    var html;
    var date_string = false;
    var info = super.GetInfo();
    if (info.URL == false) {
      info.URL = window.location.href;
    }
    
    var tag_list = document.getElementsByTagName("div"); // <div class="date showDesktop">Aug 26, 2019</div><!-- 電腦版 -->
    for(var i=0; i<tag_list.length; i++) {
      var item = tag_list[i];
      var c = item.getAttribute("class");
      if (c != null) {
        if (c.indexOf("date") != -1) {
          var stamp = Date.parse(item.innerHTML + " UTC") / 1000; // Convert Aug 26, 2019 to Time Stamp
          var html = TimeStampToDateString(stamp);
          var year = 0;
          html = html.trim();
          if (html.length > 4) {
            year = parseInt(html.substring(0, 4));
          }      
          html = html.replace("/", "-");
          html = html.replace(".", "-");
          if (html.indexOf("-") != -1 && html.length <= 10 && year > 1911) {
            date_string = html; 
            break;
          }
        }
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

class Yahoo理財 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "Yahoo理財";
    this.domain_name = "tw.money.yahoo.com";
    this.title_break = "-";
  }
  
  GetInfo() {
    var html;
    var info = super.GetInfo();    
    var date_string = false;
    var tag_list = document.getElementsByTagName("cite"); // <cite class="Mstart-6 Fz-s Fs-n C-grayishblue">2019年10月8日 下午5:57</cite>
    for (var i=0; i<tag_list.length; i++) {
      var item = tag_list[i];
      html = item.innerHTML;
      if (html.indexOf("年") != -1 && html.indexOf("月") != -1 && html.indexOf("日") != -1) {
        var p = html.indexOf("日");
        var html = html.substr(0, p);
        html = html.replace("年", "-");
        html = html.replace("月", "-");
        var year = 0;
        html = html.trim();
        if (html.length > 4) {
          year = parseInt(html.substring(0, 4));
        }
        if (html.indexOf("-") != -1 && html.length <= 20 && year > 1911) {
          date_string = html.substring(0, 10); 
          break;
        }
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

class PChome股市 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "PChome股市";
    this.domain_name = "pchome.megatime.com.tw";
    this.title_break = "-";
  }
  
  GetInfo() {
    var html;
    var info = super.GetInfo();    
    var date_string = false;
    var tag_list = document.getElementsByTagName("span"); // <span>時報-快訊 (2019-11-09 16:25:32)</span>
    for (var i=0; i<tag_list.length; i++) {
      var item = tag_list[i];
      html = item.innerHTML;
      if (html.indexOf("(") != -1 && html.indexOf(")") != -1 && html.indexOf("-") != -1) {
        var p1 = html.indexOf("(")+1;
        var p2 = html.indexOf(" ", p1);
        var html = html.substr(p1, p2-p1);
        var year = 0;
        html = html.trim();
        if (html.length > 4) {
          year = parseInt(html.substring(0, 4));
        }
        if (html.indexOf("-") != -1 && html.length <= 20 && year > 1911) {
          date_string = html.substring(0, 10); 
          break;
        }
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

class 端傳媒 extends NewsBaseClass {
  constructor() {
    super();
    this.site_name = "端傳媒";
    this.domain_name = "theinitium.com";
    this.title_break = "｜";
  }
  
  GetInfo() {
    var html;
    var date_string = false;
    var info = super.GetInfo();       // https://theinitium.com/article/20190709-notes-use-novel-technologies-protect-yourself/
    var tag = "article";
    var p1 = info.URL.indexOf(tag);
    if (p1 != -1) {
      p1 += tag.length + 1;
      var p2 = info.URL.indexOf("-", p1);
      var date_string = info.URL.substr(p1, 8);
      date_string = date_string.substr(0,4) + "-" + date_string.substr(4,2) + "-" + date_string.substr(6,2)
    }
    if (date_string != false) {
      info.Date = NormalizeDateString(date_string);      
    } else {
      info = false;
    }

    return info;
  }
}

//-----------------------------------------------------------------------------
// Message Receiver
//-----------------------------------------------------------------------------
function SetClipboard(mode, info) {
  if (mode == 0) {
    ClipboardBuffer = sprintf("%s, <a href='%s'>%s</a>", info.Date, info.URL, info.Title);
    document.execCommand('copy');
  } else if (mode == 1) {
    ClipboardBuffer = sprintf("<a href='%s'>%s</a>", info.URL, info.Title);
    document.execCommand('copy');
  }
}

function CallAPI(jobj, callback) {
  var json_args = json_encode(jobj);
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://www.dna64.com/TaiwanNewsClick/api.php?json="+json_args, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      callback(json_decode(xhr.responseText));
    }
  }
  xhr.send();
}

function apiGetInfo(url, callback) {
  var info = false;
  var args = {};
  args.Command = "GetInfo";
  args.URL = url;
  CallAPI(args, function(result) {
    if (result.Status == "Success") {
      info = result.Data;
    }
    callback(info);
  });
}

function apiGetExtConfig(callback) {
  var info = false;
  var args = {};
  args.Command = "GetExtConfig";
  args.Mode = 0;
  CallAPI(args, function(result) {
    if (result.Status == "Success") {
      info = result.Data;
    }
    callback(info);
  });
}

function ExtConfigUpdate() {
  console.log("ExtConfigUpdate");
  apiGetExtConfig(function(result) {
    var today  = new Date();
    var data = {};
    data = result;
    data.UpdatedDate = today.toLocaleDateString("en-US"); // 9/17/2016
    chrome.storage.local.set({"ExtConfig": data}, function() {
      ExtConfig = result;
    });
  });
}

function ExtConfigStartup() {
  console.log("ExtConfigStartup");
  chrome.storage.local.get(['ExtConfig'], function(result) {
    if (!("ExtConfig" in result)) {                     // Get from BackEnd if not exists in storage
      ExtConfigUpdate();
    } else {
      ExtConfig = result.ExtConfig;
      var today = new Date();
      date_string = today.toLocaleDateString("en-US");  // 9/17/2016
      if (ExtConfig.UpdatedDate != date_string) {       // Get from BackEnd if UpdatedDate not equal today
        ExtConfigUpdate();
      }
      if (DebugFlags & 1) {
        console.log(json_encode(ExtConfig));
      }
    }
  });
}

function IsSkipSite(site_name) {
  var st = false;
  var p = ExtConfig.SkipSites.indexOf(site_name);
  if (p != -1) {
    st = true;    
  }
  return st;
}

function DateFormatChecker(date_string) {
  var fields = date_string.split("-");
  var data;
  var st = false;
  var count = 0;
  if (fields.length == 3) {
    for(var i=0; i<3; i++) {
      data = fields[i];
      if (is_numeric(data)) {
        count++;
        if (count == 3) {
          st = true;
        }
      }
    }
  }
  return st;
}

function SiteDataChecker(data) {
  var st = false;
  if (data !== false) {
    if (data.Site !== false && data.URL !== false && data.Title !== false && data.Date !== false) {
      if (DateFormatChecker(data.Date) !== false) {
        st = true;
      }
    }
  }
  return st;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var info = false;
  if (request.mode == 2) {
    if (DebugFlags & 1) {
      console.log('ExtConfig Variable = ' + json_encode(ExtConfig));
      chrome.storage.local.get(['ExtConfig'], function(result) {
        console.log('ExtConfig Storage = ' + json_encode(result));
      });
    }
    ExtConfigUpdate();
    return true;
  }
  //
  // Get Information from News Class
  //
  var info = false;    
  var data;
  for (let item of NewsSiteList) {
    if (IsSkipSite(item)) {
      console.log("Skip......"+item);
      //
      // We disable the site support in extension and replace by back-end supported
      //
    } else {
      var nobj = eval("new " + item + "()");
      if (nobj.Test()) {
        data = nobj.GetInfo();
        if (DebugFlags & 1) {
          console.log("@"+item+"Class");
          console.log(data);
        }
        if (SiteDataChecker(data)) {
          if (DebugFlags & 1) {
            console.log("@"+item+"Class_OK");
          }
          info = data;
        }      
        break;
      }
    }
  }
  //
  // Try ld+json Mode if nothing
  //
  if (info == false) {
    var lobj = new LdJsonClass();
    if (lobj.Object !== false) {
      jobj = lobj.Object;
      data = {};
      data.Title = jobj.headline;
      data.Date = NormalizeDateString(jobj.datePublished);
      if (isset(jobj.url)) {
        data.URL = jobj.url;
      } else {
        data.URL = window.location.href;
      }      
      data.Site = jobj.publisher.name;
      if (DebugFlags & 1) {
        console.log("@LdJsonClass");
        console.log(data);
      }
      if (SiteDataChecker(data)) {
        if (DebugFlags & 1) {
          console.log("@LdJsonClass_OK");
        }
        info = data;
      }      
    }
  }
  //
  // Try base Class if nothing
  //
  if (info == false) {
    var nobj = new NewsBaseClass();
    var data = nobj.GetInfo();
    if (DebugFlags & 1) {
      console.log("@NewsBaseClass");
      console.log(data);
    }
    if (SiteDataChecker(data)) {
      if (DebugFlags & 1) {
        console.log("@NewsBaseClass_OK");
      }
      info = data;
    }
  }  
  //
  // Generate HTML formated data then set to clipboard
  //
  if (info != false) {
    SetClipboard(request.mode, info);
    sendResponse({farewell: "goodbye", info: info});
  } else {
    if (DebugFlags & 1) {
      console.log("BackEnd......"+window.location.href);
    }
    apiGetInfo(window.location.href, function(result) {
      console.log(result);
      if (result != false) {
        info = result;
        console.log(request.mode);
        SetClipboard(request.mode, info);
      } else {
        alert('Info: Can\'t generate news link of the page'); 
      }
      sendResponse({farewell: "goodbye", info: info});
    });
    return true;  // Inform Chrome that we will make a delayed sendResponse
  }
});