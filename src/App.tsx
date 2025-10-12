
import './App.css';
import { artifacts, groupRewards } from './data/artifacts';
import { useEffect, useState } from 'react';

// Percent Collected Component
interface PercentCollectedProps {
  found: { [id: string]: boolean };
  artifacts: any[];
}
const PercentCollected = ({ found, artifacts }: PercentCollectedProps) => {
  const total = artifacts.length;
  const collected = artifacts.filter(a => found[a.id]).length;
  const percent = total === 0 ? 0 : Math.round((collected / total) * 100);
  return (
    <div style={{ marginBottom: 16, fontSize: 18, fontWeight: 500, color: '#007a00' }}>
      Collected: {collected} / {total} ({percent}%)
    </div>
  );
};



function App() {
  const [found, setFound] = useState<{ [id: string]: boolean }>({});
  const [search, setSearch] = useState('');
  const [showHowToGet, setShowHowToGet] = useState<{ [id: string]: boolean }>({});
  const [showClue, setShowClue] = useState<{ [id: string]: boolean }>({});
  const [tab, setTab] = useState<'town' | 'space'>(() => {
    try {
      const storedTab = localStorage.getItem('artifactTab');
      if (storedTab === 'space') return 'space';
    } catch {}
    return 'town';
  });

  // Load found state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('foundArtifacts');
    if (stored) setFound(JSON.parse(stored));
  }, []);

  // Save found state to localStorage
  useEffect(() => {
    localStorage.setItem('foundArtifacts', JSON.stringify(found));
  }, [found]);

  // Save tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('artifactTab', tab);
  }, [tab]);

  const handleCheck = (id: string) => {
    setFound((prev) => {
      const newFound = { ...prev, [id]: !prev[id] };
      // If marking as found, hide clue and howToGet
      if (!prev[id]) {
        setShowClue((prevShow) => ({ ...prevShow, [id]: false }));
        setShowHowToGet((prevShow) => ({ ...prevShow, [id]: false }));
      }
      return newFound;
    });
  };

  // Use the 'type' property if present, otherwise default to 'town' for legacy artifacts
  const getType = (artifact: any) => {
    if (artifact.type) return artifact.type;
    return 'town';
  };

  const filteredArtifactsByTab = artifacts.filter(a => getType(a) === tab);
  // Group artifacts by group property
  const grouped = filteredArtifactsByTab.reduce((acc: { [group: string]: typeof artifacts }, artifact) => {
    acc[artifact.group] = acc[artifact.group] || [];
    acc[artifact.group].push(artifact);
    return acc;
  }, {});

  // Filter groups and artifacts by search
  const searchLower = search.toLowerCase();
  const filteredGroups = Object.entries(grouped).filter(([group, groupArtifacts]) => {
    // Show group if group name matches search, or any artifact in group matches search
    if (group.toLowerCase().includes(searchLower)) return true;
    return groupArtifacts.some(a => a.name.toLowerCase().includes(searchLower));
  });

  return (
    <div className="artifact-list" style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
  <img src={`${import.meta.env.BASE_URL}RandomPics/Wobbly.png`} alt="Wobbly" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 8, background: '#eee' }} />
        <h1 style={{ margin: 0 }}>Wobbly Life Artifact Tracker</h1>
      </div>
  <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
  {/* Percent Collected */}
  <PercentCollected found={found} artifacts={filteredArtifactsByTab} />
        <button
          onClick={() => setTab('town')}
          style={{
            padding: '8px 20px',
            borderRadius: 6,
            border: tab === 'town' ? '2px solid #007a00' : '1px solid #ccc',
            background: tab === 'town' ? '#e6ffe6' : '#fff',
            color: tab === 'town' ? '#007a00' : '#333',
            fontWeight: tab === 'town' ? 700 : 400,
            cursor: 'pointer',
            fontSize: 16,
          }}
        >
          Wobbly Town Artifacts
        </button>
        <button
          onClick={() => setTab('space')}
          style={{
            padding: '8px 20px',
            borderRadius: 6,
            border: tab === 'space' ? '2px solid #007a00' : '1px solid #ccc',
            background: tab === 'space' ? '#e6ffe6' : '#fff',
            color: tab === 'space' ? '#007a00' : '#333',
            fontWeight: tab === 'space' ? 700 : 400,
            cursor: 'pointer',
            fontSize: 16,
          }}
        >
          Wobbly Space Artifacts
        </button>
      </div>
      <input
        type="text"
        placeholder="Search by group or artifact name..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 24, fontSize: 16, borderRadius: 6, border: '1px solid #ccc' }}
      />
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '2rem',
        alignItems: 'stretch',
      }}>
        {filteredGroups.map(([group, groupArtifacts]) => {
          // If searching, filter artifacts in group
          const filteredArtifacts = search
            ? groupArtifacts.filter(a =>
                group.toLowerCase().includes(searchLower) ||
                a.name.toLowerCase().includes(searchLower)
              )
            : groupArtifacts;
          if (filteredArtifacts.length === 0) return null;
          return (
            <div key={group} style={{ flex: '1 1 30%', maxWidth: '32%', minWidth: 320, marginBottom: '2.5rem', background: '#fafbfc', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 16 }}>
              <h2 style={{ borderBottom: '2px solid #ccc', paddingBottom: 4, marginBottom: 8 }}>{group}</h2>
              {groupRewards[group] && (
                <div style={{ fontSize: 15, color: '#007a00', marginBottom: 12 }}>
                  <em>Reward for completing this group:</em> {groupRewards[group]}
                </div>
              )}
              <ul style={{ padding: 0 }}>
                {filteredArtifacts.map((artifact) => (
                  <li
                    key={artifact.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #ccc',
                      borderRadius: 8,
                      padding: '1rem',
                      marginBottom: '1rem',
                      background: found[artifact.id] ? '#e6ffe6' : '#fff',
                      listStyle: 'none',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!found[artifact.id]}
                      onChange={() => handleCheck(artifact.id)}
                      style={{ marginRight: 16 }}
                    />
                    <img
                      src={`${import.meta.env.BASE_URL}${artifact.image}`}
                      alt={artifact.name}
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, background: '#eee', marginRight: 16 }}
                      onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/60?text=No+Image')}
                    />
                    <div>
                      <strong>{artifact.name}</strong>
                      <div style={{ fontSize: 14, color: '#555' }}>{artifact.description}</div>
                      {artifact.clue && (
                        <>
                          {showClue[artifact.id] ? (
                            <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
                              <em>Clue:</em> {artifact.clue}
                              <button
                                style={{ fontSize: 13, color: '#007a00', marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                                onClick={() => setShowClue(prev => ({ ...prev, [artifact.id]: false }))}
                              >
                                Hide clue
                              </button>
                            </div>
                          ) : (
                            <button
                              style={{ fontSize: 13, color: '#007a00', marginTop: 2, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                              onClick={() => setShowClue(prev => ({ ...prev, [artifact.id]: true }))}
                            >
                              Show clue
                            </button>
                          )}
                        </>
                      )}
                      {artifact.howToGet && (
                        <>
                          {showHowToGet[artifact.id] ? (
                            <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
                              <em>How to get:</em> {artifact.howToGet}
                              <button
                                style={{ fontSize: 13, color: '#007a00', marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                                onClick={() => setShowHowToGet(prev => ({ ...prev, [artifact.id]: false }))}
                              >
                                Hide how to get
                              </button>
                            </div>
                          ) : (
                            <button
                              style={{ fontSize: 13, color: '#007a00', marginTop: 2, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                              onClick={() => setShowHowToGet(prev => ({ ...prev, [artifact.id]: true }))}
                            >
                              Show how to get
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App
