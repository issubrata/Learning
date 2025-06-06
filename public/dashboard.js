const e = React.createElement;
const { useState, useRef } = React;

function Dashboard() {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [entries, setEntries] = useState([]);
  const [message, setMessage] = useState(null);
  const messageRef = useRef(null);

  const submit = async (evt) => {
    evt.preventDefault();
    setMessage(null);
    try {
      const res = await fetch('/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, alias: alias || undefined })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error');
      }
      const entry = {
        short: data.short,
        url,
        created: new Date().toLocaleString(),
        clicks: 0
      };
      setEntries([entry, ...entries]);
      setUrl('');
      setAlias('');
      setMessage({ type: 'success', text: 'Short URL created!' });
      messageRef.current.focus();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      messageRef.current.focus();
    }
  };

  const copyToClipboard = (short) => {
    navigator.clipboard.writeText(window.location.origin + '/' + short);
  };

  return e('div', { className: 'container' },
    e('form', { onSubmit: submit },
      e('label', { htmlFor: 'url' }, 'Long URL'),
      e('input', {
        id: 'url',
        type: 'text',
        value: url,
        onChange: (e) => setUrl(e.target.value),
        required: true
      }),
      e('label', { htmlFor: 'alias' }, 'Custom Alias (optional)'),
      e('input', {
        id: 'alias',
        type: 'text',
        value: alias,
        onChange: (e) => setAlias(e.target.value)
      }),
      e('button', { type: 'submit', disabled: !url }, 'Shorten')
    ),
    message && e('div', {
      ref: messageRef,
      tabIndex: -1,
      role: 'alert',
      className: 'message ' + message.type
    }, message.text),
    e('div', { className: 'table-container' },
      e('table', null,
        e('thead', null,
          e('tr', null,
            e('th', null, 'Short URL'),
            e('th', null, 'Original URL'),
            e('th', null, 'Created'),
            e('th', null, 'Clicks'),
            e('th', null, 'Copy')
          )
        ),
        e('tbody', null,
          entries.map((en, i) =>
            e('tr', { key: i },
              e('td', null,
                e('a', { href: '/' + en.short }, window.location.origin + '/' + en.short)
              ),
              e('td', { style: { wordBreak: 'break-all' } }, en.url),
              e('td', null, en.created),
              e('td', null, en.clicks),
              e('td', null,
                e('button', { onClick: () => copyToClipboard(en.short) }, 'Copy')
              )
            )
          )
        )
      )
    )
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(e(Dashboard));
