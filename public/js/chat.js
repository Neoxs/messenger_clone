const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const $searchInput = document.querySelector('#search-bar-input')
const $conversationList = document.querySelector('.convo-list')
const $contactsList = document.querySelector('.contacts-list')


// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

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

socket.on('message', (message) => {
    //console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm a')
    })
    
    $messages.insertAdjacentHTML('beforeend', html)
    
    autoscroll()
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

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
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
    console.log(e.target.closest('li').dataset.roomid)
    const contactId = e.target.closest('li').dataset.id
    const roomId = e.target.closest('li').dataset.roomid
    socket.emit('join', {contactId, roomId})
})

const renderContact = (data) => {
    $contactsList.innerHTML = ""

    data.forEach(user => {
        const html = `
        <li class="row conversation-list-item" data-id="${user._id}">
            <div class="col-2 row align-self-center justify-content-center contact-img">
                <img src="/img/fem-avatar.svg" alt="avatar">
            </div>
            <div class="col row align-self-center contact-username">
                    ${user.username}  
            </div>
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