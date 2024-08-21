interface Src {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
}

interface Photos {
    id: number;
    width: number;
    height: number;
    url: string;
    photographer: string;
    photographer_url: string;
    photographer_id: number;
    avg_color: string;
    src: Src;
    liked: boolean;
    alt: string;
}

interface Pexels {
    page: number;
    per_page: number;
    photos: Photos[];
    total_results: number;
    next_page: string;
}

function getPhotoDiv(photo: Photos): string {
    return `
            <div class='photo-div'>
                <img src='${photo.src.original}' alt='${photo.alt}'>
                <div class="photographer">${photo.photographer}</div>
            </div>
            `;
}

let next_page_num: number;
let loadedPages: number = 1;
let current_page: number;
let next_page: string;

function loadMoreData(next_url:string, page_number:number) {
    if (page_number > loadedPages) {
    
        const xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                if(this.status == 200) {

                    const photoDivs = document.querySelectorAll('.container .photo-divs');
                    const numOfPhotoDivs: number = photoDivs.length;
                    let photoDivHTMLArr: string [] = [];
                    
                    for (let i:number=0; i<numOfPhotoDivs; i++) {
                        photoDivHTMLArr[i] = '';
                    }
                    
                    let photosData: Pexels = JSON.parse(xhttp.responseText);
                    
                    current_page = photosData.page;
                    next_page = photosData.next_page;

                    let position = 0;
                    photosData.photos.forEach(photo => {

                        if (position === numOfPhotoDivs)  {
                            position = 0; //reset back to zero
                        }

                        if (position < numOfPhotoDivs) {
                            photoDivHTMLArr[position] += getPhotoDiv(photo);
                            position++;
                        }
                    });
                    for (let i:number=0; i<numOfPhotoDivs; i++) {
                        photoDivs[i].innerHTML += photoDivHTMLArr[i];
                    }

                } else {
                    console.error('Failed to fetch data:', this.status, this.statusText);
                }
            }
        };
        xhttp.open("GET", `${next_url}`, true);
        xhttp.setRequestHeader('Authorization', 'U7q2HEQvNIXwg5vpMfS0FJ6RN1pWEntTkN5ZDYAT64McxYeBe2IQwWUU');
        xhttp.send();
    }
    loadedPages = page_number;
}

let lastScrollTop: number = 0;
function handleScroll() {
    const currentScrollTop = window.scrollY;

    if (currentScrollTop > lastScrollTop) {

        const scrollableHeight = document.documentElement.scrollHeight;
        const scrolledFromTop = window.scrollY + window.innerHeight;
    
        if (scrollableHeight - scrolledFromTop < 5) {
            next_page_num = current_page + 1;
            if (next_page) {
                loadMoreData(next_page, next_page_num);
            }
        }

    }

    lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
}

const searchForm = document.querySelector('#search-form') as HTMLFormElement;
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    //reset values
    next_page_num = 0;
    loadedPages = 1;
    current_page = 0;
    next_page = '';

    const xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if(this.status == 200) {

                const photoDivs = document.querySelectorAll('.container .photo-divs');
                const numOfPhotoDivs: number = photoDivs.length;
                let photoDivHTMLArr: string [] = [];
                
                for (let i:number=0; i<numOfPhotoDivs; i++) {
                    photoDivHTMLArr[i] = '';
                }
                
                let photosData: Pexels = JSON.parse(xhttp.responseText);
                
                current_page = photosData.page;
                next_page = photosData.next_page;

                let position = 0;
                photosData.photos.forEach(photo => {

                    if (position === numOfPhotoDivs)  {
                        position = 0; //reset back to zero
                    }

                    if (position < numOfPhotoDivs) {
                        photoDivHTMLArr[position] += getPhotoDiv(photo);
                        position++;
                    }
                });
                for (let i:number=0; i<numOfPhotoDivs; i++) {
                    photoDivs[i].innerHTML = photoDivHTMLArr[i];
                }

            } else {
                console.error('Failed to fetch data:', this.status, this.statusText);
            }

            window.addEventListener('scroll', handleScroll);
        }
    };
    const query = (document.querySelector('#search-bar') as HTMLInputElement).value.trim();
    const perPage: number = 30;
    xhttp.open("GET", `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}`, true);
    xhttp.setRequestHeader('Authorization', 'U7q2HEQvNIXwg5vpMfS0FJ6RN1pWEntTkN5ZDYAT64McxYeBe2IQwWUU');
    if(query !== '') {
        xhttp.send();
    }

});
