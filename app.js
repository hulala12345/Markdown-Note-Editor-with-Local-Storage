(function() {
    // Utility to generate unique IDs
    function uid() {
        return 'n-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }

    // Markdown to HTML converter (very minimal)
    function renderMarkdown(md) {
        let html = md;
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
        html = html.replace(/\n\n/g, '</p><p>');
        html = html.replace(/\n/g, '<br>');
        return '<p>' + html + '</p>';
    }

    const listEl = document.getElementById('list');
    const titleEl = document.getElementById('title');
    const dateEl = document.getElementById('date');
    const markdownEl = document.getElementById('markdown');
    const previewEl = document.getElementById('preview');

    let notes = [];
    let currentId = null;

    function loadNotes() {
        const saved = localStorage.getItem('notes');
        if (saved) {
            notes = JSON.parse(saved);
        }
    }

    function saveNotes() {
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    function refreshList() {
        listEl.innerHTML = '';
        notes.forEach(n => {
            const li = document.createElement('li');
            li.textContent = n.title || 'Untitled';
            li.dataset.id = n.id;
            if (n.id === currentId) li.classList.add('active');
            li.onclick = () => selectNote(n.id);
            listEl.appendChild(li);
        });
    }

    function selectNote(id) {
        const note = notes.find(n => n.id === id);
        if (!note) return;
        currentId = id;
        titleEl.value = note.title;
        markdownEl.value = note.body;
        dateEl.textContent = 'Created: ' + new Date(note.date).toLocaleString();
        updatePreview();
        refreshList();
    }

    function newNote() {
        const note = {
            id: uid(),
            title: '',
            body: '',
            date: Date.now()
        };
        notes.unshift(note);
        saveNotes();
        refreshList();
        selectNote(note.id);
    }

    function updateCurrent() {
        const note = notes.find(n => n.id === currentId);
        if (!note) return;
        note.title = titleEl.value;
        note.body = markdownEl.value;
        saveNotes();
        refreshList();
        updatePreview();
    }

    function updatePreview() {
        previewEl.innerHTML = renderMarkdown(markdownEl.value);
    }

    document.getElementById('new-note').addEventListener('click', newNote);
    titleEl.addEventListener('input', updateCurrent);
    markdownEl.addEventListener('input', updateCurrent);

    document.getElementById('export-md').addEventListener('click', () => exportNote('md'));
    document.getElementById('export-txt').addEventListener('click', () => exportNote('txt'));

    function exportNote(ext) {
        const note = notes.find(n => n.id === currentId);
        if (!note) return;
        const blob = new Blob([note.body], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = (note.title || 'note') + '.' + ext;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    // Initialization
    loadNotes();
    if (notes.length) {
        selectNote(notes[0].id);
    }
    refreshList();
})();
