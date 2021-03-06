const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $addFriendForm = document.querySelector('.friend-request')
const $addFormBtn = document.querySelector('.friend-request-btn')
const $addModalBody = document.querySelector('.modal-body')

const $searchInput = document.querySelector('#search-bar-input')
const $conversationList = document.querySelector('.convo-list')
const $contactsList = document.querySelector('.contacts-list')



//Options
//const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (messages) => {
    console.log(messages)
    messages = Array.from(messages)
    console.log(messages)
    messages.forEach((message) => {
        const html = `
    <div class="message">
        <p>
            <span class="message__name">${message.username}</span>
            <span class="message__meta">${moment(message.createdAt).format('h:mm a')}</span>
        </p>
        <p>${message.text}</p>
    </div>
    `
    
    $messages.insertAdjacentHTML('beforeend', html)
    
    autoscroll()
    })
})

// socket.on('shareLocation', (data) => {
//     //console.log()
//     const html = Mustache.render(locationMessageTemplate, {
//         username: data.username,
//         url: data.url,
//         createdAt: moment(data.createdAt).format('hh:mm a')
//     })
    
//     $messages.insertAdjacentHTML('beforeend', html)
    
//     autoscroll()
// })

// socket.on('roomData', ({ room, users }) => {
//     const html = Mustache.render(sidebarTemplate, {
//         room,
//         users
//     })
//     document.querySelector('.sidebar-chat-list').innerHTML = html
// })

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')
    const activeConvo = document.querySelector('.conversation-list-item-active')
    const message = e.target.elements.message.value
    const roomId = activeConvo.dataset.roomid
    const contactId = activeConvo.dataset.id
    socket.emit('sendMessage', { message, roomId, contactId }, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

// $sendLocationButton.addEventListener('click', () => {
//     if (!navigator.geolocation) {
//         return alert('Geolocation is not supported by your browser.')
//     }

//     $sendLocationButton.setAttribute('disabled', 'disabled')

//     navigator.geolocation.getCurrentPosition((position) => {
//         socket.emit('sendLocation', {
//             latitude: position.coords.latitude,
//             longitude: position.coords.longitude
//         }, () => {
//             $sendLocationButton.removeAttribute('disabled')
//             console.log('Location shared!')
//         })
//     })
// })

$searchInput.addEventListener('keydown', async (e) => {
    const query = $searchInput.value

    $conversationList.style.display = 'none'

    if(e.keyCode == 13) {
        console.log(query.includes('@'))
        let body
        if(query.includes('@')) {
            body = { email: query }
        }else {
            body = { username: query }
        }
        console.log(body)
        const res = await fetch(`/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        }).then((res) => {
            return res.json()
        }).then((data) => {
            //console.log(data)
            renderContact(data)
        })
    }
})

$searchInput.addEventListener('blur', (e) => {
    $contactsList.innerHTML = ""
    $conversationList.style.display = 'grid'
})

$conversationList.addEventListener('click', (e) => {
    $messages.innerHTML = ""
    const convArr = Array.from(document.querySelectorAll('.conversation-list-item'))
    convArr.forEach((el) => {
        el.classList.remove('conversation-list-item-active')
    })
    e.target.closest('li').classList.add('conversation-list-item-active')
    console.log(e.target.closest('li').dataset.roomid)
    const contactId = e.target.closest('li').dataset.id
    const roomId = e.target.closest('li').dataset.roomid
    socket.emit('join', {contactId, roomId})
})

$addFormBtn.addEventListener('click', (e) => {
    e.preventDefault()
    console.log("i'm here !")
    const email = document.querySelector('#recipient-email').value
    const message = document.querySelector('#message-text').value
    if(!email || !message){
        const html = `
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
            <strong>Yoo dude !</strong> You should fill this fields first.
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        `
        $addFriendForm.insertAdjacentHTML('beforebegin', html)
    }else{
        const body = { email, message }
        const res = fetch(`/add-friend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        }).then((res) => {
            return res.json()
        }).then((data) => {
            //console.log(data)
            let html
            if (data.warning) {
                html = `
                <div class="alert alert-warning alert-dismissible fade show" role="alert">
                    <strong>Yoo dude !</strong> ${data.warning}
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                `
            }else if (data.success){
                html = `
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    <strong>Yoo dude !</strong> ${data.success}
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                `
            }
            
            $addFriendForm.insertAdjacentHTML('beforebegin', html)
        })
    }
})

const renderContact = (data) => {
    $contactsList.innerHTML = ""

    data.forEach(user => {
        const html = `
        <li class="row conversation-list-item" data-id="${user._id}">
            <div class="col-2 row align-self-center justify-content-center contact-img">
                <img src="/img/fem-avatar.svg" alt="avatar">
            </div>
            <div class="col-8 row align-self-center contact-username">
                    ${user.username}  
            </div>
            <button class="col-2 align-self-center" formaction="/chat">
                <i class="fas fa-user-plus" style="color: black"></i>
            </button>
        </li>
        `
        $contactsList.insertAdjacentHTML('beforeend', html)
    });
}


// socket.emit('join', { username, room }, (error) => {
//     if(error) {
//         alert(error)
//         location.href = '/'
//     }
// })