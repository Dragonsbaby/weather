/**
 * Created by DragonBaby on 2017/11/1.
 */



(function (win) {


    var _MAXLIST_ = 0;



    var Node = function(char){
        this.info = [];
        this.char = char;
        this.child = 0;
        this.path = 'R';
        this.next = new Array(26);
    };

    var root = new Node('root');
    var T = {};
    T.insert = function (code,info) {
        var code = code.split('');
        var node = root;
        var len = code.length;

        for(var i = 0; i < len ; i++){
            node.child++;
            var index = (code[i].charCodeAt(0))-97;
            var path = node.path;
            if(node.next[index]&& node.next[index] instanceof Node){
                node = node.next[index];
            }else{
                node.next[index] = new Node(code[i]);
                node = node.next[index];
                node.path = path + '~'+index.toString();
            }
        }
        node.info.push(info);
    };

    T.find = function (str) {
        if(!isExist(str)){return null;}
        var node = root;
        for(var i = 0; i < str.length; i++){
            var index = str.charCodeAt(i) - 97;
            if(node.next[index] && node.next[index] instanceof Node){
                node = node.next[index];
            }else{
                return null;
            }
        }
        return node;
    };

    T.equal = function (code) {
        var len = code.length;
        var node = root;
        for(var i = 0; i < len; i++){
            var index = code.charCodeAt(i) - 97;
            if(node.next[index] && node.next[index] instanceof Node){
                node = node.next[index];
            }else{
                return null;
            }
        }
        if(!node.info||node.info.length<1){ return null;}
        return node;
    };

    T.del = function (code) {
        var node = T.equal(code);
        if(!isExist(node)){return "未找到该条信息"}
        var path = node.path.split("~");
        var tmp = root;
        for(var i = 1; i < path.length; i++){
            var index = parseInt(path[i]);
            tmp.child--;
            if(tmp.next[index].child <= 1){
                // tmp.next[index] = null;
                delete tmp.next[index];
                break;
            }else{
                tmp = tmp.next[index];
            }
        }

    };


    var W = {};

    W.init = function () {
        W.varyCity();
    };


    /**
     *  Trie树扫描城市ID列表 将每条城市信息存入Trie树
     */
   W.varyCity = function () {
        var city = CITY_LIST;
        for(var i = 0; i < city.length; i++){
            var arr = city[i];
            var code = arr[1];
            var info = {
                "id":arr[0],
                "city":arr[2],
                "parentCity":arr[9],
                "province":arr[7]
            };
            T.insert(code, info);
        }
    };

    /**
     *  对城市拼音进行模糊搜索
     * @param val 搜索框输入值
     */
    W.Search = function (val) {
        var result = T.find(val);
        var $box = $("#weather-list-box");
        $box.html('');
        $(".weather-list-load").hide();
        if(result == null){return false;}
        $(".weather-list-load").show();
        _MAXLIST_ = 0;
        W.traverse($box,result,0);
    };


    /**
    *  通过模糊查询得到的树节点 遍历查找出 每条完整单词的信息
    * @param box 页面dom元素用于打印结果
    * @param node ，模糊查询出的结果(树节点对象)
    */
    W.traverse = function ($box,node) {
        if(_MAXLIST_ > 10) {return false;}

        if(node.info&&node.info.length > 0){
            for(var i = 0; i < node.info.length; i++){
                var o = node.info[i];
                var text = o.city + " (" + o.province + " - " + o.parentCity +")";
                var inner = '' +
                    '<li class="list-base" key="'+o.id+'">'+text+'</li>';
                $box.append(inner);

                _MAXLIST_ += 1;
            }
        }
        for(var i = 0; i < 26; i++){
            if(node.next[i] && node.next[i] instanceof Node){
                arguments.callee($box,node.next[i]);
            }
        }
    };


    W.getData = function (id) {
        $.ajax({
            url:"https://free-api.heweather.com/s6/weather/now?",
            type : "post",
            data: {"location":id,"key":"6cfba13ca9a44aca8dc47b2abac0ceeb"},
            datatype:"jsonp",
            success:function (data) {
                console.log(data);
                loadWeather(data.HeWeather6[0]);
            }

        });
    };



    var loadWeather = function (data) {
        $(".wu-time").html(data.update.loc);   //设备刷新时间
        var o = data.now;
        $(".wcb-fl").html(o.fl + '℃');                  //体感温度
        $(".wcb-tmp").html(o.tmp + '℃');                //温度
        $(".wcb-wind-dir").html(o.wind_dir);             //风向
        $(".wcb-wind-deg").html(o.wind_deg + "°");      //风向角度
        $(".wcb-wind-sc").html(o.wind_sc);        //风力
        $(".wcb-wind-spd").html(o.wind_spd + "km/h" );   //风速
        $(".wcb-hum").html(o.hum);                  //相对湿度
        $(".wcb-pcpn").html(o.pcpn + "mm");        //降水量
        $(".wcb-pres").html(o.pres + "hPa");        //大气压强
        $(".wcb-vis").html(o.vis + "km");           //能见度
        $(".wcb-cloud").html(o.cloud);              //云量
        var cond = o.cond_txt + '<i class="wcb-cond-img" style="background:url(https://cdn.heweather.com/cond_icon/'+o.cond_code+'.png) no-repeat center/40px;"></i>';
        $(".wcb-cond").html(cond);

    };

    win.Trie = T;
    win.Weather = W;

})(window);




$(function () {

    Weather.init();

    $("#weather-input").bind('input propertychange',function () {
        Weather.Search($(this).val());
    });

    var CITY_ID = null;
    $("#weather-list-box").on("click",".list-base",function () {
        $(".weather-list-load").hide();
        var text = $(this).html();
        CITY_ID = $(this).attr("key");
        $("#weather-input").val(text);
    });


    $(".weather-search").click(function () {
        if(isExist(CITY_ID)){
            Weather.getData(CITY_ID);

        }
    });

});





var isExist = function (O) {
    if(!O||O == ''||O == null||typeof O == 'undefined'){
        return false;
    }
    return true;
};






