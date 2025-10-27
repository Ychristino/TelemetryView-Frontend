import { useEffect, useState } from 'react';
import { Layout, Menu, theme, Tabs, Input } from 'antd';
import { fetchGames } from '../services/gameData';
import EditablePageTabs from './editablePageTabs';
import TelemetryDataTransferList from './telemetryDataList';
import { WorkArea } from './workArea';

const { Header, Content, Footer, Sider } = Layout;

const MainPage = ({ refreshFoldersInterval = 1000 }) => {
    const [parameterTypesItems, setParameterTypesItems] = useState([]);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [currentSelectedParameterType, setCurrentSelectedParameterType] = useState('');

    const [tabs, setTabs] = useState([{ key: '1', label: 'Home', content: 'Conteúdo inicial' }]);
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [editingTabKey, setEditingTabKey] = useState(null);
    const [editingLabel, setEditingLabel] = useState('');

    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

    useEffect(() => {
        getMenuItems();
        setInterval(() => {
            getMenuItems();
        }, refreshFoldersInterval);

        // When running both applications theres so many changes... need to check how can i make it better
        // const listener = (event, { eventType, filename }) => getMenuItems();
        // window.telemetryData.onDirChange(listener);

        // return () => {
        //     window.telemetryData.removeDirChangeListener?.(listener);
        // };
    }, []);

    const getMenuItems = () => {
        fetchGames()
            .then(response => setParameterTypesItems(response))
            .catch(err => console.error('Error during menu items request!', err));
    };
    
    const handleMenuSelection = (event) => {
        setCurrentSelectedParameterType(event.key)
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
        setActiveTabKey(newKey);
    };

    const removeTab = (targetKey) => {
        const filteredTabs = tabs.filter(tab => tab.key !== targetKey);
        if (activeTabKey === targetKey && filteredTabs.length) {
            setActiveTabKey(filteredTabs[0].key);
        }
        setTabs(filteredTabs);
    };

    const startEditing = (key, label) => {
        setEditingTabKey(key);
        setEditingLabel(label);
    };

    const finishEditing = (key) => {
        setTabs(tabs.map(tab => tab.key === key ? { ...tab, label: editingLabel } : tab));
        setEditingTabKey(null);
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
                collapsed={isSidebarCollapsed}
                onCollapse={setIsSidebarCollapsed}
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
                    items={parameterTypesItems}
                    selectedKeys={currentSelectedParameterType}
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
                        activeKey={activeTabKey}
                        setActiveKey={setActiveTabKey}
                        onEdit={onEdit}
                        editingKey={editingTabKey}
                        editingLabel={editingLabel}
                        setEditingLabel={setEditingLabel}
                        startEditing={startEditing}
                        finishEditing={finishEditing}
                        content={<WorkArea 
                            parameterData={currentSelectedParameterType}
                        />}
                    />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainPage;
