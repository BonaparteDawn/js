/**
 *作者：Bonaparte.Dawn
 *版本：1.0.RELEASE
 *注意：欲使用本通用js必须提前引入jquery插件
 */

var printLog = true;
/**
 * 对象校验
 */
var object = function(){
    return{
        isEmpty:function(temp){
            return !object.isNotEmpty(temp);
        },
        isNotEmpty:function(temp){
            var res = false;
            if(temp){
                res = true;
            }
            return res;
        },
        hasLength:function(temp){
            var res = false;
            if(object.isNotEmpty(temp) && temp.length>0){
                res = true;
            }
            return res;
        },
        isTrue:function(temp){
            var res = false;
            if(object.isNotEmpty(temp) && temp == true){
                res = true;
            }
            return res;
        },
        isFalse:function(temp){
            return !object.isTrue(temp);
        }
    };
}();
/**
 * 传入参数校验
 */
var assert= function(){
    return {
        notEmpty:function(temp,msg){
            if(object.isEmpty(temp)){
                throw new Error(msg);
            }
        },
        empty:function(temp,msg){
            if(object.isNotEmpty(temp)){
                throw new Error(msg);
            }
        },
        hasLength:function(temp,msg){
            if(!temp || temp.length==0){
                throw new Error(msg);
            }
        }
    }
}();
//函数===================================================================================
/**
 *图片加载函数
 */
function loadImg(obj){
    var handler = $(obj);
    var val = handler.attr("data-img");
    var img = obj;
    img.onload = function(){
        if (img.complete == true) {
            handler.attr("src",img.src);
            handler.removeAttr("onload");
            img.onload = null;
            if(printLog){
                console.log("图片加载到");
            }
        }
    }
    //如果因为网络或图片的原因发生异常，则显示该图片
    img.onerror = function(){
        img.src = 'images/noimg.png';
    };
    img.src = val;
}
//类===================================================================================
/**
 * 网络连接类
 */
function NetConnection() {
    //使用表单句柄GET数据到服务器
    this.httpGetByFormHandler = function(url,formHandler,successFunction,errorFunction,connectErro){
        assert.hasLength(url,"URL地址为空！");
        assert.notEmpty(formHandler,"formHandler为空！");
        this.httpGet(url,formHandler.serialize(),successFunction,errorFunction,connectErro);
    }
    //使用表单句柄POST数据到服务器
    this.httpPostByFormHandler = function(url,formHandler,successFunction,errorFunction,connectErro){
        assert.hasLength(url,"URL地址为空！");
        assert.notEmpty(formHandler,"formHandler为空！");
        this.httpPost(url,formHandler.serialize(),successFunction,errorFunction,connectErro);
    }
    //GET数据到服务器，然后服务器返回JSON数据格式
    this.httpGetReturnJson = function(url,json_parameter,successFunction,errorFunction,connectErro){
        assert.hasLength(url,"URL地址为空！");
        this.httpGet(url,json_parameter,function(data){
            try{
                var json = JSON.parse(data);
                successFunction(json,json_parameter);
            }catch(err){
                if(errorFunction || errorFunction != null){
                    errorFunction(data,json_parameter);
                }else{
                    alert(JSON.stringify(err));
                }
                window.location.reload();
            }
        },errorFunction,connectErro);
    }
    //POST数据到服务器，然后服务器返回JSON数据格式
    this.httpPostReturnJson = function(url,json_parameter,successFunction,errorFunction,connectErro){
        assert.hasLength(url,"URL地址为空！");
        this.httpPost(url,json_parameter,function(data){
            try{
                var json = JSON.parse(data);
                successFunction(json,json_parameter);
            }catch(err){
                if(errorFunction || errorFunction != null){
                    errorFunction(data,json_parameter);
                }else{
                    alert(JSON.stringify(err));
                }
                window.location.reload();
            }
        },errorFunction,connectErro);
    }
    //GET数据到服务器
    this.httpGet = function (url, json_parameter, successFunction, errorFunction, connectErro){
        assert.hasLength(url,"URL地址为空！");
        $.get(url,json_parameter,function(data,status){
            if(status && status == 'success'){
                successFunction(data,json_parameter);
            }else {
                if(errorFunction || errorFunction != null){
                    errorFunction(data,json_parameter);
                }else{
                    alert(JSON.stringify(status));
                }
            }
        }).error(function(e){
            if(connectErro || connectErro != null){
                connectErro(e);
            }else{
                alert(JSON.stringify(e));
            }
        });
    }
    //POST数据到服务器
    this.httpPost = function(url,json_parameter,successFunction,errorFunction,connectErro) {
        assert.hasLength(url,"URL地址为空！");
        $.post(url, json_parameter, function(data, status) {
            if(status && status == 'success'){
                successFunction(data,json_parameter);
            }else {
                if(errorFunction || errorFunction != null){
                    errorFunction(data,json_parameter);
                }else{
                    alert(JSON.stringify(status));
                }
            }
        }).error(function(e){
            if(connectErro || connectErro != null){
                connectErro(e);
            }else{
                alert(JSON.stringify(status));
            }
        });
    }
    /**
     * 以POST的形式提交form表单数据给服务器，表单中支持文件流上传，该方法需要使用jquery.form.js插件
     */
    this.submitForm =function(form_handler,url,successFunction,errorFunction,connectErro){
        assert.notEmpty(form_handler,"form_handler为空");
        assert.hasLength(url,"url为空");
        var submited = form_handler.data("submited");//防止未执行完一个请求又重复提交的标记
        if (object.isEmpty(submited) || object.isFalse(submited)) {
            form_handler.data("submited",true);
            form_handler.ajaxSubmit({
                type:'post',
                url:url,
                success:function(data){
                    form_handler.data("submited",false);
                    if(printLog){
                        console.log(data);
                    }
                    if(object.isNotEmpty(data)){
                        successFunction(data);
                    }else{
                        errorFunction(data);
                    }
                },
                error:function(XmlHttpRequest,textStatus,errorThrown){
                    form_handler.data("submited",false);
                    if (connectErro) {
                        connectErro(XmlHttpRequest,textStatus,errorThrown);
                    }else {
                        if(object.isTrue(printLog)){
                            console.log(XmlHttpRequest);
                            console.log(textStatus);
                            console.log(errorThrown);
                        }
                        alert("失败");
                    }
                }
            })
        }else {
            console.log("请勿重新提交");
        }
    }
    /**
     * 以POST的方式提交某个<input name="fileElement" type="file"></input>的文件数据（需要使用的插件为ajaxfileupload.js）
     */
    this.uploadFileElement = function(fileElement_handler,url,successFunction,errorFunction,connectErro) {
        assert.notEmpty(fileElement_handler,"fileElement_handler为空");
        assert.hasLength(url,"url为空");
        var fileElement = fileElement_handler.attr("name");
        if (object.isNotEmpty(fileElement)) {
            var submited = fileElement_handler.data("submited");//防止重复提交的标记
            if (object.isEmpty(submited) || object.isFalse(submited)) {
                fileElement_handler.data("submited",true);
                $.ajaxFileUpload({
                    url : url,
                    secureuri : false,
                    fileElementId : fileElement,
                    type : 'POST',
                    dataType : 'text',
                    success: function (data, status){
                        fileElement_handler.data("submited",false);
                        if(object.isTrue(printLog)){
                            console.log(data);
                        }
                        if(object.isNotEmpty(data)){
                            successFunction(data);
                        }else{
                            errorFunction(data);
                        }
                    },
                    error : function(data, status, e){
                        fileElement_handler.data("submited",false);
                        if (connectErro) {
                            connectErro(data,status,e);
                        }else {
                            alert("上传失败");
                            if(object.isTrue(printLog)){
                                console.log(data);
                            }
                        }
                    }
                });
            }else {
                if(object.isTrue(printLog)){
                    console.log("请勿重新提交");
                }
            }
        }else {
            alert("fileElement does not contain.")
        }
    }
};