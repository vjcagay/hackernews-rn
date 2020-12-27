import React, { useEffect, useRef, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
        if (buttonIndex !== options.length - 1) {
          setStoryType(Object.keys(viewOptions)[buttonIndex] as StoryType);
        }
      },
    );
  };

  const [refreshing, setRefreshing] = useState(false);

  const [storyType, setStoryType] = useState<StoryType>(Object.keys(viewOptions)[0] as StoryType);

  const [stories, setStories] = useState<Story[]>([]);

  const getStories = async (view: StoryType) => {
    setRefreshing(true);

    const result = await fetch(endpoints[view]);
    const itemIds: Stories = await result.json();

    const top20 = itemIds.slice(0, 20);

    const items = await Promise.all(top20.map(async (itemId) => getStoryById(itemId)));

    setStories(items);
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
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={selectStoryType} style={styles.button}>
            <Text style={styles.buttonText}>{viewOptions[storyType]}</Text>
            <Icon name="chevron-down" size={32} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={stories}
          renderItem={ListItem}
          keyExtractor={(story) => story.id.toString()}
          refreshing={refreshing}
          onRefresh={() => getStories(storyType)}
          ref={(ref) => (flatList.current = ref)}
        />
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
  scrollView: {
    flex: 1,
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
  },
});

const ConnectedApp = connectActionSheet(App);

const AppContainer = () => (
  <ActionSheetProvider>
    <ConnectedApp />
  </ActionSheetProvider>
);

export default AppContainer;
