import React from 'react';
import { Tabs, Input } from 'antd';

const EditablePageTabs = ({
    tabs,
    activeKey,
    setActiveKey,
    onEdit,
    editingKey,
    editingLabel,
    setEditingLabel,
    startEditing,
    finishEditing,
    content
}) => {
    return (
        <Tabs
            type="editable-card"
            onEdit={onEdit}
            activeKey={activeKey}
            onChange={setActiveKey}
            items={tabs.map(tab => ({
                key: tab.key,
                closable: tab.key !== '1',
                label: editingKey === tab.key ? (
                    <Input
                        value={editingLabel}
                        autoFocus
                        onChange={(e) => setEditingLabel(e.target.value)}
                        onBlur={() => finishEditing(tab.key)}
                        onPressEnter={() => finishEditing(tab.key)}
                        onClick={(e) => e.stopPropagation()}  
                        onKeyDown={(e) => e.stopPropagation()}
                        style={{ width: '100%' }}
                    />
                ) : (
                    <div
                        onDoubleClick={(e) => {
                            e.stopPropagation();       
                            startEditing(tab.key, tab.label);
                        }}
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            userSelect: 'none',
                            padding: '0 8px',
                        }}
                    >
                        {tab.label}
                    </div>
                ),
                children: content,
            }))}
        />
    );
};

export default EditablePageTabs;
