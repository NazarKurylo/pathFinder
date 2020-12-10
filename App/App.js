import React, {Component} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import ArrowDown from './Assets/ArrowDown.svg';
import ArrowUp from './Assets/ArrowUp.svg';
import {Grid, DijkstraFinder} from 'pathfinding';
import {matrix, classrooms} from './Helpers';

const headerText =
  'Вкажіть від якої і до якої аудиторії Ви бажаєте знайти шлях';
const buttonText = 'Пошук';
const errorText = 'Ви вже знаходитесь у вибраній аудиторії.'

export default class App extends Component {
  state = {
    isOpenFirstDropdown: false,
    isOpenSecondDropdown: false,
    firstClassroom: undefined,
    secondClassroom: undefined,
    isError: false,
    showMap: false,
  };

  render() {
    const {showMap, isError} = this.state;
    return (
      <SafeAreaView style={styles.main}>
        <ScrollView>
          {this.renderHeader()}
          {this.renderButton()}
          {isError && this.renderError()}
          {showMap && !isError && this.renderMap()}
        </ScrollView>
      </SafeAreaView>
    );
  }

  handleFirstDropdownPress = () => {
    const {isOpenFirstDropdown} = this.state;
    this.setState({isOpenFirstDropdown: !isOpenFirstDropdown});
  };
  handleSecondDropdownPress = () => {
    const {isOpenSecondDropdown} = this.state;
    this.setState({isOpenSecondDropdown: !isOpenSecondDropdown});
  };
  handleFirstDropdownItemPress = (classroom) => {
    const {secondClassroom} = this.state;
    this.setState({firstClassroom: classroom, isOpenFirstDropdown: false});
    if (secondClassroom == classroom) {
      this.setState({isError: true, showMap: false})
    } else {
      this.setState({isError: false})
    }
  };
  handleSecondDropdownItemPress = (classroom) => {
    const {firstClassroom} = this.state;
    this.setState({secondClassroom: classroom, isOpenSecondDropdown: false});
    if (firstClassroom == classroom) {
      this.setState({isError: true, showMap: false})
    } else {
      this.setState({isError: false})
    }
  };

  renderHeader = () => {
    const {
      isOpenFirstDropdown,
      isOpenSecondDropdown,
      firstClassroom,
      secondClassroom,
    } = this.state;
    return (
      <View style={styles.headerBlock}>
        <Text style={styles.headerText}>{headerText}</Text>

        <View style={styles.mainBlock}>
          <View style={styles.block}>
            <Text>Від:</Text>
            <View style={styles.dropdownMainBlock}>
              <TouchableOpacity
                style={styles.dropdownBlock}
                onPress={this.handleFirstDropdownPress}>
                <Text>{firstClassroom && Object.keys(firstClassroom)[0]}</Text>
                {isOpenFirstDropdown ? <ArrowUp /> : <ArrowDown />}
              </TouchableOpacity>
              {isOpenFirstDropdown && (
                <View style={styles.dropdownContentBlock}>
                  <ScrollView>
                    {classrooms.map((classroom) => (
                      <TouchableOpacity
                        style={styles.dropdownItemBlock}
                        onPress={this.handleFirstDropdownItemPress.bind(
                          this,
                          classroom,
                        )}>
                        <Text>{Object.keys(classroom)[0]}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          <View style={styles.block}>
            <Text>До:</Text>
            <View style={styles.dropdownMainBlock}>
              <TouchableOpacity
                style={styles.dropdownBlock}
                onPress={this.handleSecondDropdownPress}>
                <Text>
                  {secondClassroom && Object.keys(secondClassroom)[0]}
                </Text>
                {isOpenSecondDropdown ? <ArrowUp /> : <ArrowDown />}
              </TouchableOpacity>
              {isOpenSecondDropdown && (
                <View style={styles.dropdownContentBlock}>
                  <ScrollView>
                    {classrooms.map((classroom) => (
                      <TouchableOpacity
                        style={styles.dropdownItemBlock}
                        onPress={this.handleSecondDropdownItemPress.bind(
                          this,
                          classroom,
                        )}>
                        <Text>{Object.keys(classroom)[0]}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  handleButtonPress = () => {
    this.setState({showMap: true, isOpenFirstDropdown: false, isOpenSecondDropdown: false});
  };

  renderButton = () => {
    const {firstClassroom, secondClassroom, isError} = this.state;
    const isDisabled = !firstClassroom || !secondClassroom || isError;
    return (
      <View style={styles.buttonMainBlock}>
        <TouchableOpacity
          style={[styles.buttonBlock, isDisabled && styles.buttonIsDisabled]}
          onPress={this.handleButtonPress}
          disabled={isDisabled}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  renderError = () => {
    return (
      <Text style={styles.errorText}>{errorText}</Text>
    )
  }

  renderMap = () => {
    const {firstClassroom, secondClassroom} =this.state; 
    const grid = new Grid(matrix);
    const finder = new DijkstraFinder();
    const xStart = Object.values(firstClassroom)[0].x;
    const yStart = Object.values(firstClassroom)[0].y;
    const xEnd = Object.values(secondClassroom)[0].x;
    const yEnd = Object.values(secondClassroom)[0].y;
    const path = finder.findPath(xStart, yStart, xEnd, yEnd, grid);
    path.shift();
    path.pop();
    return (
      <ScrollView horizontal style={styles.mapBlock} showsHorizontalScrollIndicator={false}>
        <View>
          {grid.nodes.map((row, rowIndex) => (
            <View style={styles.row}>
              {row.map((cell, cellIndex) => {
                const isStartCell = rowIndex === yStart && cellIndex === xStart;
                const isEndCell = rowIndex === yEnd && cellIndex === xEnd;
                let isPathCell = false;
                path.map((pCell) => {
                  if (pCell[0] === cellIndex && pCell[1] === rowIndex) {
                    isPathCell = true;
                  }
                });
                let isWallCell = matrix[rowIndex][cellIndex] === 1;
                return (
                  <View
                    style={[
                      styles.cell,
                      isStartCell && styles.startCell,
                      isEndCell && styles.endCell,
                      isPathCell && styles.pathCell,
                      isWallCell && styles.wallCell,
                    ]}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  headerBlock: {
    marginTop: 20,
  },
  headerText: {
    fontSize: 26,
    textAlign: 'center',
  },
  mainBlock: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 20,
  },
  block: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownMainBlock: {
    marginLeft: 10,
    alignItems: 'center',
  },
  dropdownBlock: {
    width: 100,
    height: 25,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 5,
  },
  dropdownContentBlock: {
    position: 'absolute',
    top: 30,
    height: 300,
    width: 60,
    borderColor: 'black',
    borderRadius: 5,
    borderWidth: 2,
    backgroundColor: 'lightgrey'
  },
  dropdownItemBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
    marginVertical: 3,
  },
  buttonMainBlock: {
    alignItems: 'center',
    marginBottom: 20,
    zIndex: -10,
  },
  buttonBlock: {
    width: 100,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: '#000000',
  },
  buttonIsDisabled: {
    backgroundColor: '#999999',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    textAlign: 'center',
    zIndex: -10,
  },
  mapBlock: {
    zIndex: -10,
    marginHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 10,
    height: 10,
  },
  startCell: {
    backgroundColor: 'red',
  },
  endCell: {
    backgroundColor: 'blue',
  },
  pathCell: {
    backgroundColor: 'orange',
  },
  wallCell: {
    backgroundColor: 'black',
  },
});
