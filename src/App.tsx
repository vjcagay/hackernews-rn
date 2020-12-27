import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { ActionSheetProvider, connectActionSheet, useActionSheet } from "@expo/react-native-action-sheet";

import endpoints, { getStoryById } from "./endpoints";

const viewOptions: { [key in StoryType]: string } = {
  top: "Top",
  new: "New",
  best: "Best of HN",
  ask: "Ask HN",
  show: "Show HN",
  job: "Jobs",
};

const App = () => {
  const { showActionSheetWithOptions } = useActionSheet();

  const flatList = useRef<FlatList | null>();

  const selectStoryType = async () => {
    const options = [...Object.values(viewOptions), "Cancel"];

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
      },
      (buttonIndex) => {
        const selectedStoryType = Object.keys(viewOptions)[buttonIndex] as StoryType;

        if (buttonIndex !== options.length - 1 && storyType !== selectedStoryType) {
          setLoading(true);
          setStoryType(selectedStoryType);
        }
      },
    );
  };

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [storyType, setStoryType] = useState<StoryType>(Object.keys(viewOptions)[0] as StoryType);

  const [stories, setStories] = useState<Story[]>([]);

  const getStories = async (view: StoryType) => {
    const result = await fetch(endpoints[view]);
    const itemIds: Stories = await result.json();

    const top20 = itemIds.slice(0, 20);

    const items = await Promise.all(top20.map(async (itemId) => getStoryById(itemId)));

    setStories(items);
    setLoading(false);
    setRefreshing(false);
    flatList.current?.scrollToOffset({ offset: 0 });
  };

  useEffect(() => {
    getStories(storyType);
  }, [storyType]);

  const ListItem = ({ item }: { item: Story }) => {
    return (
      <TouchableOpacity style={styles.item}>
        <Text numberOfLines={2} style={styles.itemTitle}>
          {item.title}
        </Text>
        {item.url && (
          <Text numberOfLines={1} style={styles.itemUrl}>
            {item.url}
          </Text>
        )}
        <View style={styles.itemMeta}>
          <View style={styles.itemMetaItem}>
            <Text style={[styles.itemMetaItemText, styles.itemMetaAuthor]}>{item.by}</Text>
          </View>
          {item.score && (
            <View style={styles.itemMetaItem}>
              <Text>
                <Icon name="arrow-up" size={14} style={styles.itemMetaItemText} />
                <Text style={styles.itemMetaItemText}>{item.score}</Text>
              </Text>
            </View>
          )}
          {item.descendants !== null && (
            <View style={styles.itemMetaItem}>
              <Text>
                <Icon name="message-circle" size={14} style={styles.itemMetaItemText} />
                <Text style={styles.itemMetaItemText}>{item.descendants}</Text>
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const Loading = () => (
    <View style={styles.loading}>
      <ActivityIndicator />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={selectStoryType} style={styles.button}>
            <Text style={styles.buttonText}>{viewOptions[storyType]}</Text>
            <Icon name="chevron-down" size={32} />
          </TouchableOpacity>
        </View>
        {loading ? (
          <Loading />
        ) : (
          <FlatList
            data={stories}
            renderItem={ListItem}
            keyExtractor={(story) => story.id.toString()}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              getStories(storyType);
            }}
            ref={(ref) => (flatList.current = ref)}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: "column",
  },
  header: {
    borderBottomColor: "rgba(0, 0, 0, 0.22)",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 32,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
  },
  item: {
    borderBottomColor: "rgba(0, 0, 0, 0.22)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    padding: 16,
    minHeight: 80,
    flex: 1,
    justifyContent: "center",
  },
  itemTitle: {
    fontWeight: "600",
    fontSize: 18,
    marginBottom: 4,
  },
  itemUrl: {
    color: "rgba(0, 0, 0, 0.50)",
    marginBottom: 4,
  },
  itemMeta: {
    flex: 1,
    flexDirection: "row",
  },
  itemMetaItem: {
    marginRight: 8,
  },
  itemMetaItemText: {
    color: "rgba(0, 0, 0, 0.70)",
  },
  itemMetaAuthor: {
    fontWeight: "600",
  },
  itemMetaIcon: {
    marginHorizontal: 4,
  },
});

const ConnectedApp = connectActionSheet(App);

const AppContainer = () => (
  <ActionSheetProvider>
    <ConnectedApp />
  </ActionSheetProvider>
);

export default AppContainer;
