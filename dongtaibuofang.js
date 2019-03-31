var data = [];
//获取元素
var bar = document.querySelector('.bar')
var audio = document.querySelector('audio');
var pic = document.querySelector('.ctr-pic img');
var singer = document.querySelector('.singer span');
var start = document.querySelector('.ctr-btn .start');
var prev = document.querySelector('.ctr-btn .prev');
var next = document.querySelector('.ctr-btn .next');
var currentTime = document.querySelector('.time .current');
var totalTime = document.querySelector('.time .totalTime');
var borBox = document.querySelector('.bor-box .toble');
var ctrBar = document.querySelector('.ctr-bar');
var now = document.querySelector('.now');
var modeBtn = document.querySelector('.mode');
var listBox = document.querySelector('.list-box ul');
var searchTxt = document.querySelector('#searchTxt');
var searchBtn = document.querySelector('#searchBtn');
var lis = null;
// 当前第几首歌
var index = 0;
//旋转角度
var rotateDeg = 0;
//保存定时器
var timer = null;
// 标识当前播放模式  0代表顺序 1代表单曲 2代表随机
var mode = 0;
// 保存图片的positionY轴的值
var modeArr = [-206,-233,-73];
//加载动态
searchBtn.addEventListener('click',function () {
    //搜索音乐列表
    //进行ajax请求
    $.ajax({
        url:'https://api.imjad.cn/cloudmusic/',
        data:{
            type:'search',
            s:searchTxt.value
        },
        type:'get',
        success: function (data1) {
            data = data1.result.songs;

            var str = '';
            for(var i = 0; i < data.length; i++){
                str += '<li><span>'+data[i].name+'</span><span>';
                for (var j = 0 ; j < data[i].ar.length ; j++) {
                    str +=data[i].ar[j].name + '   ';
                }
                str +='</span></li>';
            }
            listBox.innerHTML = str;
            lis = document.querySelectorAll('li');
            lis[index].className = 'active';
        },
        error: function (err) {
            console.log(err);
        }
    })
});

modeBtn.addEventListener('click',function () {
    mode = ++mode > modeArr.length - 1 ? 0 : mode;
    modeBtn.style.backgroundPositionY = modeArr[mode] + 'px';
});

$('.list-box ul').on('click','li',function () {
    index = $(this).index();
    audio.src='http://music.163.com/song/media/outer/url?id='+data[index].id+'.mp3';
    init();
    play();
    // $.ajax({
    //        url:'https://api.imjad.cn/cloudmusic/',
    //        data:{
    //            type:'song',
    //            id:data[index].id
    //        },
    //        type:'get',
    //        success: function (data) {
    //           audio.src = data.data[0].url;
    //           init();
    //           play();
    //        },
    //        error: function (err) {
    //            console.log(err);
    //        }
    //    })
});
// 创建一个init方法
function init() {
    // 初始化专辑封面 歌手歌曲名 播放路径 播放时间
    rotateDeg = 0;
    //pic.src = data[index].pic;
    // audio.src = data[index].url;
    var songStr = '';

    for (var j = 0 ; j < data[index].ar.length ; j++) {
        songStr +=data[index].ar[j].name + '   ';
    }
    singer.innerHTML = data[index].name + '---'+songStr;

    // 切换列表选中项
    for(var i = 0; i < data.length; i++){
       lis[i].className = '';
    }
    lis[index].className = 'active';
}
// init();
// 播放
function play (){
    pic.src = data[index].al.picUrl;
    // 播放音乐
    audio.play();
    // 播放按钮变成暂停
    start.style.backgroundPositionX = -30 + 'px';
    // 专辑封面旋转
    // 在开启一个新的定时器之前 先清掉上一个定时器
    clearInterval(timer);//无效
    timer = setInterval(function () {
        rotateDeg++;
        pic.style.transform = 'rotate('+rotateDeg+'deg)';
    },30);
}
//播放按钮
start.addEventListener('click',function () {
    //audio.paused为true的时候是暂停的
    if (audio.paused) {
        // 播放音乐
        play();
    }else{
        //暂停音乐
        audio.pause();
        start.style.backgroundPositionX = 0 + 'px';
        //清除定时器
        clearInterval(timer);
    }
});
//上一曲
prev.addEventListener('click',function () {
    //三元运算符
    index = --index < 0 ? data.length - 1 : index;
    init();
    play();
});
//下一曲
next.addEventListener('click',function () {
    //三元运算符
    index = ++index > data.length ? 0 : index;
    init();
    play();
});
//格式化时间格式
function formatTime(time) {
    return time > 9 ? time : '0' + time;
}
//NaN --- not a number
//准备时间
//canplay 当音频文件准备完成后 触发canplay事件
audio.addEventListener('canplay',function () {
    //需要将音乐总时长转换成分钟数和秒钟数
    var min = parseInt(audio.duration / 60);
    var se = parseInt(audio.duration % 60);
    totalTime.innerHTML = formatTime(min)+':'+formatTime(se);

    audio.addEventListener('timeupdate',function () {
        var cMin = parseInt(audio.currentTime / 60);
        var cSe = parseInt(audio.currentTime % 60);
        currentTime.innerHTML = formatTime(cMin) + ':' + formatTime(cSe);

        var left = audio.currentTime / audio.duration *  borBox.clientWidth;
        console.log(left);
        ctrBar.style.left = left + 'px';
        now.style.width = left + 'px';

        if(audio.ended){
            switch (mode) {
                case 0:
                    index = ++index > data.length - 1 ? 0 : index;
                    init();
                    play();
                    break;
                case 1:
                    init();
                    play();
                    break;
                case 2:
                    do{
                        var randomNum = Math.floor(Math.random() * data.length);
                    }while (randomNum === index);
                    index = randomNum;

                    // 递归算法
                    // function getRandom() {
                    //     var randomNum = Math.floor(Math.random() * data.length);
                    //     if(randomNum === index){
                    //         randomNum = getRandom();
                    //     }
                    //     return randomNum;
                    // }
                    // index = getRandom();
                    init();
                    play();
                    break;
            }
        }
    });
    // 滑动效果
    ctrBar.addEventListener('mousedown',function (e) {
        // console.log(ctrBar.offsetLeft);
        e.stopPropagation();

        ctrBar.addEventListener('mouseenter',function (e) {
            e.stopPropagation();

        });

    });

    ctrBar.addEventListener('mouseup',function (e) {
        e.stopPropagation();

    });

    borBox.addEventListener('click',function (e) {
        // 找到鼠标的位置
        // 鼠标点击的对象的相对位置
        // 当前鼠标点击的位置 / 总宽度 * 音乐总时长 = 当前音乐需要播放的位置
        audio.currentTime = e.offsetX / borBox.clientWidth * audio.duration;
        // console.log(barBox.clientWidth)

    })

});
//播放空格键盘事件
window.addEventListener('keydown',function (e) {
    // 检测按下了那个键
    console.log(e.keyCode);
    if(e.keyCode === 32){
        if (audio.paused) {
            // 播放音乐
            play();
        }else{
            //暂停音乐
            audio.pause();
            start.style.backgroundPositionX = 0 + 'px';
            //清除定时器
            clearInterval(timer);
        }
    }
    if(e.keyCode === 37){
        index = --index < 0 ? data.length - 1 : index;
        init();
        play();
    }
    if(e.keyCode === 39){
        index = ++index > data.length ? 0 : index;
        init();
        play();
    }
    if (e.keyCode === 16) {
        if(audio.ended===0){
            index = ++index > data.length - 1 ? 0 : index;
            init();
            play();
        } else if(audio.ended===1){
            init();
            play();
        } else if(audio.ended===2){
            do{
                var randomNum = Math.floor(Math.random() * data.length);
            }while (randomNum === index);
            index = randomNum;
        }
    }
});