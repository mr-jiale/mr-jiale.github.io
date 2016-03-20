(function(){
        document.addEventListener('DOMContentLoaded', function(){
        [
            /**function list**/
            ajax('/data/site.json', siteInit),
            ajax('/data/post.json', refreshPostList),
            ajax('/data/page.json', pageNavInit),
            route,
            navBtnClick,
            popBtnClick,
            routeMethod
        ].map(setTimeout);
    })

    /**ajax**/
    function ajax(ajaxUrl,ajaxHandler){
        //console.log(ajaxUrl);
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState == 4 && request.status == 200) {
                ajaxHandler(request.responseText);
            }
        }
        request.open('GET', ajaxUrl);
        request.send();
    }

    var postListArray;

    function refreshPostList(postJson){
        var postListContainer = document.getElementById("post-list-container");
            postList = document.getElementsByClassName("post-list")[0]
        postListArray = JSON.parse(postJson);
        createPostList(10, postListArray);
        postListContainer.addEventListener('scroll', function(){
            if(postListContainer.scrollTop + postListContainer.offsetHeight >= postList.offsetHeight){
                createPostList(3, postListArray);
            }
        }, false);
    }

    function generatePostListItem(obj){
        return '<li class=\"post-list-item\" data-catelist="'
                + obj.categories.join(' ')
                + '"><h2 class=\"post-list-title\"><a class="post-link" href=\"#' 
                + obj.url
                + '\">' 
                + obj.title 
                + '</a></h2><p class=\"post-meta\"><span class="post-date">' 
                + obj.date + '</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="post-tag">' 
                + obj.tags.join('</span> / <span class="post-tag">') 
                + '</span></p>'
                + '<section class=\"post-excerpt\">'
                + obj.excerpt
                + '</section></li>';
    }

    function createPostList(n, arr){
        var postList = document.getElementsByClassName("post-list")[0],
            postListHtml = postList.innerHTML;
        for(var i=0; i<n; i++){
            if(arr[i]){
                postListHtml += generatePostListItem(postListArray[i]);
            }else{
                break;
            }
        }
        arr.splice(0,i);
        postList.innerHTML = postListHtml;
    }

    function pageNavInit(pageJson){
        var pageListArray = JSON.parse(pageJson);
        var pageNav = document.getElementsByClassName('page-nav')[0],
            pageNavHtml  = pageNav.innerHTML,
            pageCount=0;
        for(var i=0; i<pageListArray.length; i++){
            if(pageListArray[i].title){
            pageCount ++;
            pageNavHtml += ('<li><a href="#@'
                        + pageListArray[i].url 
                        + '" rel="' 
                        + pageListArray[i].title 
                        + '" data-pagenum="'
                        + pageCount
                        + '" class="icon icon-nav '
                        + pageListArray[i].icon + '"></a></li>');
            }
        }
        pageNav.innerHTML = pageNavHtml;
    }

    function siteInit(siteJson){
        var siteInfo = JSON.parse(siteJson);
        document.getElementsByClassName('copyright')[0].innerHTML = 'Copyright &copy; 2016 <a href="https://github.com/mr-jiale" target="_blank">Zhang Jiale</a>';
        document.head.getElementsByTagName('title')[0].innerHTML = siteInfo.title;

        var cateList=document.getElementsByClassName('cate-list')[0],
            cateHtml=cateList.innerHTML + '<li><a href="#@blogs&cate=all">All<span class="cate-count">'
                                        + siteInfo.postCount
                                        + "</span></a></li>";
        for(var i=0; i<siteInfo.categories.length; i++){
            cateHtml += ('<li><a href="#@blogs&cate='
                            + siteInfo.categories[i].name
                            +'">'
                            + siteInfo.categories[i].name
                            +'<span class="cate-count">'
                            + siteInfo.categories[i].count
                            + '</span></a></li>'           
                        );
        }
        cateList.innerHTML = cateHtml;

        var contactList=document.getElementsByClassName('contact-list')[0],
            contactHtml=contactList.innerHTML;
        for(var i=0; i<siteInfo.contact.length; i++){
            contactHtml += ('<li><a href="'
                        + siteInfo.contact[i].link
                        + '"'
                        + (siteInfo.contact[i].type == 'email' ? '' : 'target="_blank"')
                        + 'class="icon icon-contact icon-'
                        + siteInfo.contact[i].type.toLowerCase()
                        + '" rel="'
                        + siteInfo.contact[i].user
                        +'"></a></li>'
                );
        }
        contactList.innerHTML = contactHtml;
    }

    function navBtnClick(){
        var fullScreenBtn = document.getElementById('fullscreen-btn');
        fullScreenBtn.addEventListener('click', function(){
            if(document.webkitFullscreenElement){
                document.webkitExitFullscreen();
                fullScreenBtn.classList.add('icon-fullscreen');
                fullScreenBtn.classList.remove('icon-exitfullscreen');
            }else{
                document.body.webkitRequestFullScreen();
                fullScreenBtn.classList.remove('icon-fullscreen');
                fullScreenBtn.classList.add('icon-exitfullscreen');
            }
        });
    }

    function popBtnClick(){
        var popBtn = document.getElementById('pop-btn');
        popBtn.addEventListener('click', function(){
            var postView,
                currentViewPost;
            if(postView = document.getElementsByClassName('post-view')[0]){
                (currentViewPost = postView.getElementsByClassName('view')[0]).scrollTop = 0;
            }else{
                currentActivePage = document.getElementsByClassName('active')[0];
                currentActivePage.scrollTop = 0;
            }
        });
    }

    function routeMethod(){
            var postContainer = document.getElementsByClassName('post-container')[0],
                pageContainer = document.getElementsByClassName('page-container')[0],
                primaryInner = document.getElementsByClassName('primary-inner')[0];
            var hashHistory = [],
                hash = window.location.hash,
                hashUrl,
                currentViewPost,
                currentActivePage;
                switch (true) {
                    case !hash:
                        window.location.hash='#@blogs';
                        break;
                    case /^\#\@/.test(hash):
                        // pages
                        hashUrl=hash.slice(2);
                        currentActivePage = document.getElementsByClassName('active')[0];
                        if(currentActivePage.id != hashUrl){
                            currentActivePage.classList.remove('active');
                            var pageIsExist = document.getElementById(hashUrl);

                            if(/^\#\@blogs/ .test(hash)){
                                document.getElementById('post-list-container').classList.add('active');
                                if(hash != "#@blogs"){
                                    var blogListFilter=hash.slice(8);
                                    switch (true) {
                                        case /^cate=/ .test(blogListFilter):
                                            createPostList(postListArray.length, postListArray);
                                            var postListItemArray =  document.getElementsByClassName('post-list-item');
                                            var cateFilter = blogListFilter.slice(5);
                                                if(cateFilter != 'all'){
                                                    for(var i=0; i<postListItemArray.length; i++){
                                                        var dataCateList = postListItemArray[i].getAttribute('data-catelist');
                                                        if(postListItemArray[i].classList.contains('hide')){
                                                            if(dataCateList.match(cateFilter)){
                                                                postListItemArray[i].classList.remove('hide');
                                                            }
                                                        }else{
                                                            if(dataCateList.match(cateFilter)){
                                                                postListItemArray[i].classList.remove('hide');
                                                            }else{
                                                                postListItemArray[i].classList.add('hide');
                                                            }
                                                        }
                                                    }
                                                }else{
                                                    for(var i=0; i<postListItemArray.length; i++){
                                                        postListItemArray[i].classList.remove('hide');
                                                    }
                                                }
                                            break;
                                        default:
                                            // statements_def
                                            break;
                                    }
                                }else{
                                    var postList = document.getElementsByClassName("post-list")[0];
                                    var postHide = postList.children;
                                    //console.log(postHide);
                                    if(postHide){
                                        for(var i=0; i<postHide.length; i++){
                                            postHide[i].classList.remove('hide');
                                        }
                                    }
                                }
                            }else if(pageIsExist){
                                pageIsExist.classList.add('active');
                            }else{
                                ajax(hashUrl ,function(pageHtml){
                                    var pageNav = document.getElementsByClassName('page-nav')[0],
                                        tempElement = document.createElement('div'),
                                        selector = 'li>a[href="' + hash + '"]';
                                    tempElement.setAttribute('data-pagenum', pageNav.querySelector(selector).getAttribute('data-pagenum'));
                                    tempElement.setAttribute('class', 'page-item active');
                                    tempElement.setAttribute('id', hashUrl);
                                    tempElement.innerHTML = pageHtml;
                                    pageContainer.appendChild(tempElement);
                                });
                            }
                        }
                        if(primaryInner.classList.contains('post-view')){
                            setTimeout(function(){primaryInner.classList.remove('post-view');},100);
                        }
                        break;
                    case /^\#\//.test(hash):
                        // posts
                        hashUrl=hash.slice(1);
                        currentViewPost = document.getElementsByClassName('view')[0];
                        var postIsExist = document.getElementById(hashUrl);
                        if(postIsExist){
                            if(currentViewPost){
                                if(currentViewPost != postIsExist){
                                    currentViewPost.classList.remove('view');
                                    postIsExist.classList.add('view');
                                }
                            }else{
                                postIsExist.classList.add('view');
                            }
                        }else{
                            if(currentViewPost){
                                currentViewPost.classList.remove('view');
                            }
                            ajax(hashUrl, function(postHtml){
                                var tempElement = document.createElement('div');
                                tempElement.setAttribute('class', 'post-item view');
                                tempElement.setAttribute('id', hashUrl);
                                tempElement.innerHTML = postHtml;
                                postContainer.appendChild(tempElement);
                            });
                        }
                        if(!primaryInner.classList.contains('post-view')){
                            setTimeout(function(){primaryInner.classList.add('post-view');},100);
                        }
                        break;
                    default:
                        // statements_def
                        break;
                }
        }

    function route(){
        window.addEventListener('hashchange', routeMethod, false);
    }

    function search(){

    }

    function addLinkTarget(){

    }
}())

