$(document).ready(()=>{
    $.getJSON('/get_current_user').done(data=>{
        if(data.message==='success'){
            console.log(data)
            const user=data.data;
            $('.login').remove();
            $('#showname').text(user.fullname)
            $('#showname2').text(user.fullname)
        }else{
            $('.logout').remove();
        }
    })
})