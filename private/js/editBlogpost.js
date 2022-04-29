
function fillblog(blog) {
    $('#title').val(blog.title);
    $('#publish_date').val(blog.publish_date);
    $('#author').val(blog.author)
    $('#text').val(blog.text);
    $('#image').val(blog.image);
}

function onCancel() {
    location.href='/admin-blog-list'
}
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const error_message = urlParams.get('error_message');
const blog_id=urlParams.get('_id')

$('form').on('submit', function () {
    if(blog_id){
        $('form').append(()=>{
            const input = $('<input>')
                .attr('name','_id')
                .attr('value',blog_id)
            return input
        })
    }
});

// if error load the last input from for, this probably wont work
if(error_message){
    fillblog(blog);
    $('#error_message').text(error_message);
}


//if no error load from db
if(blog_id && !error_message){
    $.getJSON('/get-blog-by-id?blog_id='+blog_id)
        .done((data)=>{
            if(data['message']==='success'){
                console.log(data.data);
                fillblog(data.data);
            }
        })
}
