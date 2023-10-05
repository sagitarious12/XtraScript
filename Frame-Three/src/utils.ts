
export const getHtml = (path: string, resolve: (value: HTMLTemplateElement) => void): void => {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState !== 4) return;
        if (this.status !== 200) {
            console.error("COULD NOT FIND HTML FILE WITH PATH", path);
            throw 'Failed to retrieve html file';
        }
        const template = document.createElement('template');
        template.innerHTML = xhr.response;
        resolve(template);
    }
    xhr.open('GET', path, true);
    xhr.send();
}

export const getStyles = (path: string, html: HTMLTemplateElement, resolve: (value: {css: string, html: HTMLTemplateElement}) => void): void => {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState !== 4) return;
        if (this.status !== 200) {
            console.error("COULD NOT FIND CSS FILE WITH PATH", path);
            throw 'Failed to retrieve css file';
        }
        resolve({css: xhr.response, html});
    }
    xhr.open('GET', path, true);
    xhr.send();
} 