async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyBNulGsNG3EYFD3g1He--brjVTRT6pB42Q`);
        const data = await response.json();
        console.log(data.models.map(m => m.name).join('\n'));
    } catch (e) {
        console.error(e);
    }
}

listModels();
