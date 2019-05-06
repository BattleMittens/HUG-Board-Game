let questions = [];

fetch('Dormammu.json')
    .then((res) =>
    {
        return res.json();
    })
    .then((json) =>
    {
        questions = json;
    });


    
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
    if(questions.length === 0)
    {
        questions = oldQuestions;
        oldQuestions = [];
    }

    let i = ~~(Math.random() * questions.length);
    oldQuestions.push(questions[i]);
    return questions.splice(i, 1)[0];
}

let oldQuestions = [];