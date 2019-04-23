# gnclc-poc


Proof of concept for nodejs implemntation of [genome-nexus-annotation-pipeline](https://github.com/genome-nexus/genome-nexus-annotation-pipeline)

# How to run

`node index.js <path/to/input>`

For example,

`time node index.js input.txt `

# Performance

When you run the app it will display the time taken for annotation in milliseconds. 

when I tried with `input.txt` (or example input on https://github.com/genome-nexus/genome-nexus-annotation-pipeline) average performance time was around **1000ms**. 

![input.txt](https://github.com/thobhanifreddy/gnclc-poc/blob/master/screenshots/input.png)

For `large_input.txt` which is like 100 lines of input(I just copied example input 50 times) average performance time was around **5500**. 

![large_input.txt](https://github.com/thobhanifreddy/gnclc-poc/blob/master/screenshots/large_input.png)

I tried to annotate 1 million lines. But my network was not able to handle that many request to togeather. I tried to create batches 500 and tried doing it again. Maximum number of anootations was able to perform was **20500** in **15mins.** I will work on this and try to make it good enough to do 1 million(though it depends on various factors like network, local environment, hardware, OS etc.)

![very_large_input.txt](https://github.com/thobhanifreddy/gnclc-poc/blob/master/screenshots/very_large_input.png)


# Implementation 

I have implemented [Retrieves VEP annotation for the provided genomic location](https://genomenexus.org/swagger-ui.html#!/annotation45controller/fetchVariantAnnotationByGenomicLocationGET). 

- There are no external libraries used. 
- I have used ES6.
- For asyncroniztioin funtions, `async/await` is used. 

#this is test by saurabhshalu
