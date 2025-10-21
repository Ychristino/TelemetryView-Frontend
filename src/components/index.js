import { useEffect, useState } from 'react';
import { Layout, Menu, theme, Tabs, Input } from 'antd';
import { fetchGames } from '../services/gameData';
import EditablePageTabs from './editablePageTabs';
import TelemetryDataTransferList from './telemetryDataList';
import { WorkArea } from './workArea';

const { Header, Content, Footer, Sider } = Layout;

const MainPage = () => {
    const [items, setItems] = useState([]);
    const [collapsed, setCollapsed] = useState(false);
    
    const [tabs, setTabs] = useState([{ key: '1', label: 'Home', content: 'Conteúdo inicial' }]);
    const [activeKey, setActiveKey] = useState('1');
    const [editingKey, setEditingKey] = useState(null);
    const [editingLabel, setEditingLabel] = useState('');
    const [currentParameterType, setCurrentParameterType] = useState('');

    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

    useEffect(() => {
        getMenuItems();
        const listener = (event, { eventType, filename }) => getMenuItems();
        window.telemetryData.onDirChange(listener);

        return () => {
            window.telemetryData.removeDirChangeListener?.(listener);
        };
    }, []);

    const getMenuItems = () => {
        fetchGames()
            .then(response => setItems(response))
            .catch(err => console.error('Error during menu items request!', err));
    };
    
    const handleMenuSelection = (event) => {
        setCurrentParameterType(event.key)
    }

    const addTab = () => {
        const lastNumber = tabs.reduce((max, tab) => {
            const match = tab.label.match(/Tab (\d+)/);
            const num = match ? parseInt(match[1], 10) : 0;
            return Math.max(max, num);
        }, 0);

        const newIndex = lastNumber + 1;
        const newKey = String(Date.now());

        setTabs([
            ...tabs,
            { key: newKey, label: `Tab ${newIndex}`, content: `Content of Tab ${newIndex}` }
        ]);
        setActiveKey(newKey);
    };

    const removeTab = (targetKey) => {
        const filteredTabs = tabs.filter(tab => tab.key !== targetKey);
        if (activeKey === targetKey && filteredTabs.length) {
            setActiveKey(filteredTabs[0].key);
        }
        setTabs(filteredTabs);
    };

    const startEditing = (key, label) => {
        setEditingKey(key);
        setEditingLabel(label);
    };

    const finishEditing = (key) => {
        setTabs(tabs.map(tab => tab.key === key ? { ...tab, label: editingLabel } : tab));
        setEditingKey(null);
        setEditingLabel('');
    };

    const onEdit = (targetKey, action) => {
        if (action === 'add') addTab();
        else removeTab(targetKey);
    };

    return (
        <Layout hasSider>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                collapsedWidth={80}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'sticky',
                    insetInlineStart: 0,
                    top: 0,
                    bottom: 0,
                    scrollbarWidth: 'thin',
                    scrollbarGutter: 'stable'
                }}
            >
                <div className="logo-vertical" />
                <Menu 
                    theme="dark" 
                    mode="inline" 
                    defaultSelectedKeys={['1']} 
                    items={items}
                    selectedKeys={currentParameterType}
                    onClick={handleMenuSelection}
                />
            </Sider>

            <Layout>
                <Content style={{ margin: '24px 16px 0', overflow: 'initial', height: '100vh' }}>
                    <div style={{
                        padding: 0,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                        height: '100%'
                    }}>
                    <EditablePageTabs
                        tabs={tabs}
                        activeKey={activeKey}
                        setActiveKey={setActiveKey}
                        onEdit={onEdit}
                        editingKey={editingKey}
                        editingLabel={editingLabel}
                        setEditingLabel={setEditingLabel}
                        startEditing={startEditing}
                        finishEditing={finishEditing}
                        content={<WorkArea 
                            parameterData={currentParameterType}
                        />}
                    />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainPage;
