var searchForm = document.querySelector('.new-artist-search')
searchForm.addEventListener('submit', function( e ) {
  e.preventDefault()

  var trackName = document.querySelector('input[name="nameSearch"]').value
  var url = "https://api.spotify.com/v1/search?q=" + trackName + "&type=track"
  var token = "BQByDgBf2slXqWt2Bg6PdeAV6Y4JyCSDHSKFewJcBA7pwCUWt7dhjHy4eDkJkidotHMJBlKgTJxh1kAeXNOx47QF0kUcQKHTEiT8vXj8tul8WAxsOR4tgUOfg1L1zh9P2aSOoRVkZ9P9VhrRBmA"

  var request = new XMLHttpRequest()

  request.addEventListener('load', handleRequest)
  request.open('GET' ,url) //takes two arguments 1. the type of request 2. where we are making our request
  request.setRequestHeader('Authorization','Bearer BQBCwh4qyAud5EnINiT7VogwprbIqDDfn-bkyH67Yszq73nrjUR16cIRpJRtIZr6wAgNid-o-iBqFsr_ul9homi5jVmRtYixDLe2Ri8gYKv4VMO_X_8VheqBTz5tyZR-EOIv7Ugwv143XG_ZcFQ')
  request.setRequestHeader('Accept', 'application/json')
  // request.setRequestHeader('Access-Control-Allow-Headers','*')
  request.send()

  function handleRequest(){
    var response = JSON.parse(request.response)
    console.log(response.songs)
    var results = {
      tracks: []
    }
    for ( let i = 0; i < response.tracks.items.length; i++ ){
      console.log(i)
      try{
        var single = {
          name: response.tracks.items[i].name,
          image: response.tracks.items[i].images[0].url,
          description: response.tracks.items[i].genres[0]
        }
        results.tracks.push(single)
      }
      catch (err){

      }
    }
    // console.log(results)
    // var single = {
    //   name: response.artists.items[0].name,
    //   image: response.artists.items[0].images[0].url,
    //   description: response.artists.items[0].genres[0]
    // }
    results.tracks.push(single)
    var app = document.querySelector('.searchResultsApp')
    var list = document.createElement('ul')

    for (let i = 0; i < results.tracks.length; i++ ){
      var item = document.createElement('li')

      var form1 = document.createElement('form')
      form1.action = '/tracks/new'
      form1.method = 'POST'
      item.appendChild(form1)

      var label = document.createElement('label')
      label.for = 'description'
      label.innerHTML = results.artists[i].name
      form1.appendChild(label)

      var inputName = document.createElement('input')
      inputName.type = 'hidden'
      inputName.name = 'name'
      inputName.value = results.artists[i].name
      form1.appendChild(inputName)

      var inputImage = document.createElement('input')
      inputImage.type = 'hidden'
      inputImage.name = 'image'
      inputImage.value = results.artists[i].image
      form1.appendChild(inputImage)

      var inputDesc = document.createElement('input')
      inputDesc.type = 'hidden'
      inputDesc.name = 'description'
      inputDesc.value = results.artists[i].description
      form1.appendChild(inputDesc)

      var submitButton = document.createElement('button')
      submitButton.type = 'submit'
      submitButton.innerHTML = 'Add'
      form1.appendChild(submitButton)

      //item.innerHTML = results.artists[i].name

      list.appendChild(item)

    }
    console.log(list)
    // var templateSource = document.querySelector('#search-result-template')
    // var template = Handlebars.compile( templateSource.innerHTML )
    // console.log(results.artists)
    // var renderedTemplate = template({artists:['1','2','3']})//results)
    // console.log(renderedTemplate)
    // app.innerHTML = list//renderedTemplate
    app.appendChild( list )

  }

})
