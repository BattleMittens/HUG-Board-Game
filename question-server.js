
/**
 * Gives a random question to answer
 * Make sure it returns an object with the properties
 * question: The question to ask
 * a: Option A
 * b: Option B
 * c: Option C
 * d: Option D
 * correct: The correct answer (a, b, c, or d)
 */
function nextQuestion()
{
    // blah blah blah
    // some logic to get me a question
    // I don't really care how it works just get me a question


    const fs = require('fs') 
  
    // Reading data in utf-8 format 
    // which is a type of character set. 
    // Instead of 'utf-8' it can be  
    // other character set also like 'ascii' 
    fs.readFile('Dormammu.txt', 'utf-8', (err, data) =>
    { 
        if (err) throw err; 
    
        // Converting Raw Buffer to text 
        // data using tostring function. 

        console.log(data); 
    })

    var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream('file.in')
      });
      
      lineReader.on('line', function (line) {
        console.log('Line from file:', line);
      });

    let container = [];
    container.push(question);

    let question =
    {
        question: 'What was the year Jamestown was founded?',
        a: '1607',
        b: '1812',
        c: '1600',
        d: '1774',
        correct: 'a'
    }

    return question;
}